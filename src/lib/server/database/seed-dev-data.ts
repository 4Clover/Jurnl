/**
 * Development seed script to populate test data for friends functionality
 * This should only be used in development with the memory server
 */

// https://www.dicebear.com/how-to-use/http-api/

import connectToDatabase from './database';
import { User, Journal, Entry } from './schemas';
import type { Document } from 'mongoose';
import type { IUser } from './schemas';

interface TestUser {
    username: string;
    email: string;
    username_display: string;
    bio_text: string;
    bio_image_url?: string;
    avatar_url?: string;
    google_id: string;
}

const testUsers: TestUser[] = [
    {
        username: 'alice_writer',
        email: 'alice@example.com',
        username_display: 'Alice Cooper',
        bio_text: 'Daily journaler and coffee enthusiast ☕',
        avatar_url: 'https://api.dicebear.com/7.x/personas/svg?seed=alice',
        google_id: 'alice_test_google_id',
    },
    {
        username: 'bob_traveler',
        email: 'bob@example.com',
        username_display: 'Bob the Explorer',
        bio_text: 'Adventure seeker documenting travels 🌍',
        avatar_url: 'https://api.dicebear.com/7.x/personas/svg?seed=bob',
        google_id: 'bob_test_google_id',
    },
    {
        username: 'charlie_dev',
        email: 'charlie@example.com',
        username_display: 'Charlie Code',
        bio_text: 'Software developer who journals about tech and life 💻',
        avatar_url: 'https://api.dicebear.com/7.x/personas/svg?seed=charlie',
        google_id: 'charlie_test_google_id',
    },
    {
        username: 'diana_artist',
        email: 'diana@example.com',
        username_display: 'Diana Arts',
        bio_text: 'Creative soul sharing art and inspiration 🎨',
        avatar_url: 'https://api.dicebear.com/7.x/personas/svg?seed=diana',
        google_id: 'diana_test_google_id',
    },
];

export async function seedTestUsers(currentUserId?: string): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
        console.error('❌ Seed script should not be run in production!');
        return;
    }

    try {
        await connectToDatabase();

        console.log('🌱 Seeding test users for development...');

        // Check if test users already exist
        const existingUsers = await User.find({
            username: { $in: testUsers.map((u) => u.username) },
        });

        if (existingUsers.length > 0) {
            console.log(
                '✅ Test users already exist:',
                existingUsers.map((u) => u.username),
            );

            // If currentUserId provided, add friends relationship
            if (currentUserId) {
                await addFriendsToCurrentUser(currentUserId, existingUsers);
            }
            return;
        }

        const createdUsers = [];

        for (const testUser of testUsers) {
            const user = new User({
                username: testUser.username,
                email: testUser.email,
                google_id: testUser.google_id,
                username_display: testUser.username_display,
                bio_text: testUser.bio_text,
                bio_image_url: testUser.bio_image_url || testUser.avatar_url,
                avatar_url: testUser.avatar_url,
                auth_provider: 'google',
                close_friends: [],
                can_view_friends: [],
            });

            const savedUser = await user.save();
            createdUsers.push(savedUser);

            // SAMPLE JOURNAL
            const journal = new Journal({
                title: `${testUser.username_display}'s Journal`,
                description: `Personal journal of ${testUser.username_display}`,
                cover_color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][
                    Math.floor(Math.random() * 4)
                ],
                user: savedUser._id,
            });

            const savedJournal = await journal.save();

            const sampleEntries = [
                {
                    title: 'Welcome to my journal',
                    content_zones: {
                        picture_text: {
                            image: { url: null, alt: '', caption: '' },
                            text: '',
                        },
                        list: { items: [] },
                        text_right: { content: '' },
                    },
                    free_form_content: `Hello! This is my first journal entry. I'm excited to start documenting my thoughts and experiences here.`,
                    user: savedUser._id,
                    journal: savedJournal._id,
                    entry_date: new Date().toISOString(),
                    shared_with_friends: 'public',
                },
                {
                    title: `${testUser.username_display}'s daily thoughts`,
                    content_zones: {
                        picture_text: {
                            image: { url: null, alt: '', caption: '' },
                            text: '',
                        },
                        list: {
                            items: [
                                {
                                    text: 'Had coffee this morning',
                                    checked: true,
                                },
                                {
                                    text: 'Read an interesting article',
                                    checked: true,
                                },
                                {
                                    text: 'Plan weekend activities',
                                    checked: false,
                                },
                            ],
                        },
                        text_right: {
                            content:
                                'Looking forward to sharing more thoughts!',
                        },
                    },
                    free_form_content: `Reflecting on today's events and planning for tomorrow. Hope my friends enjoy reading this!`,
                    user: savedUser._id,
                    journal: savedJournal._id,
                    entry_date: new Date(
                        Date.now() - 24 * 60 * 60 * 1000,
                    ).toISOString(),
                    shared_with_friends: 'public',
                },
                {
                    title: `What I learned today`,
                    content_zones: {
                        picture_text: {
                            image: { url: null, alt: '', caption: '' },
                            text: '',
                        },
                        list: { items: [] },
                        text_right: { content: '' },
                    },
                    free_form_content: `
                        Every day brings new insights. 
                        Today I discovered something fascinating about 
                        ${
                            testUser.bio_text.includes('coffee')
                                ? 'brewing techniques'
                                : testUser.bio_text.includes('travel')
                                  ? 'local cultures'
                                  : testUser.bio_text.includes('tech')
                                    ? 'programming patterns'
                                    : 'creative expression'
                        }. 
                        Sharing this with friends!`,
                    user: savedUser._id,
                    journal: savedJournal._id,
                    entry_date: new Date(
                        Date.now() - 2 * 24 * 60 * 60 * 1000,
                    ).toISOString(),
                    shared_with_friends: 'public',
                },
                // PUBLIC ENTRY
                {
                    title: 'Weekend adventures',
                    content_zones: {
                        picture_text: {
                            image: { url: null, alt: '', caption: '' },
                            text: '',
                        },
                        list: { items: [] },
                        text_right: { content: '' },
                    },
                    free_form_content: `Had an amazing weekend! ${
                        testUser.username === 'alice_writer'
                            ? 'Found a new coffee shop with the perfect ambiance for writing.'
                            : testUser.username === 'bob_traveler'
                              ? 'Explored a hidden trail just outside the city - breathtaking views!'
                              : testUser.username === 'charlie_dev'
                                ? "Finally finished that side project I've been working on."
                                : testUser.username === 'diana_artist'
                                  ? "Created something beautiful today that I'm really proud of."
                                  : ''
                    }`,
                    user: savedUser._id,
                    journal: savedJournal._id,
                    entry_date: new Date(
                        Date.now() - 3 * 24 * 60 * 60 * 1000,
                    ).toISOString(),
                    shared_with_friends: 'public',
                },
                // PRIVATE ENTRY
                {
                    title: 'Personal reflection',
                    content_zones: {
                        picture_text: {
                            image: { url: null, alt: '', caption: '' },
                            text: '',
                        },
                        list: { items: [] },
                        text_right: { content: '' },
                    },
                    free_form_content: `Some thoughts I'm keeping private for now...`,
                    user: savedUser._id,
                    journal: savedJournal._id,
                    entry_date: new Date(
                        Date.now() - 4 * 24 * 60 * 60 * 1000,
                    ).toISOString(),
                    shared_with_friends: 'private',
                },
            ];

            for (const entryData of sampleEntries) {
                const entry = new Entry(entryData);
                await entry.save();
            }

            console.log(
                `✅ Created user: ${testUser.username} with journal and ${sampleEntries.filter((e) => e.shared_with_friends === 'public').length} public entries`,
            );
        }

        // Add friends relationship if currentUserId provided
        if (currentUserId) {
            await addFriendsToCurrentUser(currentUserId, createdUsers);
        }

        console.log(
            `🎉 Successfully seeded ${createdUsers.length} test users!`,
        );
        console.log(
            '📝 You can now test friends functionality with these users:',
        );
        testUsers.forEach((user) => {
            console.log(`   - ${user.username} (${user.username_display})`);
        });
        if (currentUserId) {
            console.log(
                '👥 All test users have been added as friends to current user',
            );
            console.log('📰 Shared journal entries created for feed testing');
        }
        console.log('🔑 All test users use Google OAuth authentication');
    } catch (error) {
        console.error('❌ Error seeding test users:', error);
    }
}

async function addFriendsToCurrentUser(
    currentUserId: string,
    testUsers: (Document & IUser)[],
): Promise<void> {
    try {
        const testUserIds = testUsers.map((user) => user._id);

        // Add all test users to current user's close_friends
        await User.findByIdAndUpdate(currentUserId, {
            $addToSet: { close_friends: { $each: testUserIds } },
        });

        // Add current user to all test users' can_view_friends
        await User.updateMany(
            { _id: { $in: testUserIds } },
            { $addToSet: { can_view_friends: currentUserId } },
        );

        // Test users add current user as friend : reciprocal relationship so current user can see their entries
        await User.updateMany(
            { _id: { $in: testUserIds } },
            { $addToSet: { close_friends: currentUserId } },
        );

        // Add test users to current user's can_view_friends : allows current user to see test users' public entries in the feed
        await User.findByIdAndUpdate(currentUserId, {
            $addToSet: { can_view_friends: { $each: testUserIds } },
        });

        console.log(
            '✅ Friends relationships created successfully (reciprocal)',
        );
    } catch (error) {
        console.error('❌ Error creating friends relationships:', error);
    }
}

export async function clearTestData(): Promise<void> {
    try {
        await connectToDatabase();

        console.log('🧹 Clearing test data...');

        const testUsernames = testUsers.map((u) => u.username);
        const usersToDelete = await User.find({
            username: { $in: testUsernames },
        });

        if (usersToDelete.length === 0) {
            console.log('✅ No test data to clear');
            return;
        }

        const userIds = usersToDelete.map((u) => u._id);

        const deletedEntries = await Entry.deleteMany({
            user: { $in: userIds },
        });
        console.log(`🗑️ Deleted ${deletedEntries.deletedCount} entries`);

        const deletedJournals = await Journal.deleteMany({
            user: { $in: userIds },
        });
        console.log(`🗑️ Deleted ${deletedJournals.deletedCount} journals`);

        const deletedUsers = await User.deleteMany({
            username: { $in: testUsernames },
        });
        console.log(`🗑️ Deleted ${deletedUsers.deletedCount} users`);

        console.log('✅ Test data cleared successfully');
    } catch (error) {
        console.error('❌ Error clearing test data:', error);
    }
}

// SEED VIA CLI
if (import.meta.url === `file://${process.argv[1]}`) {
    const command = process.argv[2];

    if (command === 'seed') {
        await seedTestUsers().then(() => process.exit(0));
    } else if (command === 'clear') {
        await clearTestData().then(() => process.exit(0));
    } else {
        console.log('Usage: npm run seed-dev [seed|clear]');
        process.exit(1);
    }
}
