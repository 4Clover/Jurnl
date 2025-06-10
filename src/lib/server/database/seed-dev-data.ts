/**
 * Development seed script to populate test data for friends functionality
 * This should only be used in development with the memory server
 */

// https://www.dicebear.com/how-to-use/http-api/

import connectToDatabase from './database';
import { User, Journal, Entry } from './schemas';
import { hashPassword } from '../auth/password';
import type { Document } from 'mongoose';
import type { IUser } from './schemas';

interface TestUser {
    username: string;
    email: string;
    password: string;
    username_display: string;
    bio_text: string;
    bio_image_url?: string;
    avatar_url?: string;
}

const testUsers: TestUser[] = [
    {
        username: 'alice_writer',
        email: 'alice@example.com',
        password: 'testpass123',
        username_display: 'Alice Cooper',
        bio_text: 'Daily journaler and coffee enthusiast ☕',
        avatar_url: 'https://api.dicebear.com/7.x/personas/svg?seed=alice',
    },
    {
        username: 'bob_traveler',
        email: 'bob@example.com',
        password: 'testpass123',
        username_display: 'Bob the Explorer',
        bio_text: 'Adventure seeker documenting travels 🌍',
        avatar_url: 'https://api.dicebear.com/7.x/personas/svg?seed=bob',
    },
    {
        username: 'charlie_dev',
        email: 'charlie@example.com',
        password: 'testpass123',
        username_display: 'Charlie Code',
        bio_text: 'Software developer who journals about tech and life 💻',
        avatar_url: 'https://api.dicebear.com/7.x/personas/svg?seed=charlie',
    },
    {
        username: 'diana_artist',
        email: 'diana@example.com',
        password: 'testpass123',
        username_display: 'Diana Arts',
        bio_text: 'Creative soul sharing art and inspiration 🎨',
        avatar_url: 'https://api.dicebear.com/7.x/personas/svg?seed=diana',
    },
];

export async function seedTestUsers(currentUserId?: string): Promise<void> {
    // Safety check - only run in development
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

        // Create test users
        const createdUsers = [];

        for (const testUser of testUsers) {
            const hashedPassword = await hashPassword(testUser.password);

            const user = new User({
                username: testUser.username,
                email: testUser.email,
                password: hashedPassword,
                username_display: testUser.username_display,
                bio_text: testUser.bio_text,
                bio_image_url: testUser.bio_image_url || testUser.avatar_url,
                avatar_url: testUser.avatar_url,
                auth_provider: 'password',
                close_friends: [],
                can_view_friends: [],
            });

            const savedUser = await user.save();
            createdUsers.push(savedUser);

            // Create a sample journal for each user
            const journal = new Journal({
                title: `${testUser.username_display}'s Journal`,
                description: `Personal journal of ${testUser.username_display}`,
                cover_color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][
                    Math.floor(Math.random() * 4)
                ],
                user: savedUser._id,
            });

            const savedJournal = await journal.save();

            // Create sample entries (some will be shared with current user)
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
                    shared_with_friends: currentUserId ? 'private' : 'public',
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
                    shared_with_friends: currentUserId ? 'private' : 'public',
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
                    free_form_content: `Every day brings new insights. Today I discovered something fascinating about ${testUser.bio_text.includes('coffee') ? 'brewing techniques' : testUser.bio_text.includes('travel') ? 'local cultures' : testUser.bio_text.includes('tech') ? 'programming patterns' : 'creative expression'}. Sharing this with friends!`,
                    user: savedUser._id,
                    journal: savedJournal._id,
                    entry_date: new Date(
                        Date.now() - 2 * 24 * 60 * 60 * 1000,
                    ).toISOString(),
                    shared_with_friends: currentUserId ? 'private' : 'public',
                },
            ];

            for (const entryData of sampleEntries) {
                const entry = new Entry(entryData);
                await entry.save();
            }

            console.log(
                `✅ Created user: ${testUser.username} with journal and sample entries`,
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
        console.log('🔑 All test users have password: testpass123');
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

        console.log('✅ Friends relationships created successfully');
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

        // Delete entries
        const deletedEntries = await Entry.deleteMany({
            user: { $in: userIds },
        });
        console.log(`🗑️ Deleted ${deletedEntries.deletedCount} entries`);

        // Delete journals
        const deletedJournals = await Journal.deleteMany({
            user: { $in: userIds },
        });
        console.log(`🗑️ Deleted ${deletedJournals.deletedCount} journals`);

        // Delete users
        const deletedUsers = await User.deleteMany({
            username: { $in: testUsernames },
        });
        console.log(`🗑️ Deleted ${deletedUsers.deletedCount} users`);

        console.log('✅ Test data cleared successfully');
    } catch (error) {
        console.error('❌ Error clearing test data:', error);
    }
}

// If running this file directly
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
