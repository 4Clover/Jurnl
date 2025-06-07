import type { PageLoad } from '../../../../../.svelte-kit/types/src/routes';

export const load: PageLoad = ({ params }) => {
    const { friend } = params;
     // This is where we could get the user's info from their username
    const info = {
        username: friend,
        bio_text: "I love to cook in my free time and I want to start gardening sometime soon. I have a huge house that is not managed so I probably want to work on that as well... But that's all I want, what do I actually do?",
        bio_image_url: "https://i.pinimg.com/736x/7f/c6/24/7fc62415024ac0f80b6db0fac7a32863.jpg"
    }
    // This is where we could get the user's shared journal and filled up journals
    const journals = [
            {
                title: 'Travel Journal',
                entries: [
                    { name: 'Paris Arrival', date: '2024-04-15' },
                    { name: 'Louvre Visit', date: '2024-04-16' },
                    { name: 'Train to Nice', date: '2024-04-18' },
                ],
            },
            {
                title: 'Daily Thoughts',
                entries: [
                    { name: 'Monday Motivation', date: '2025-06-02' },
                    { name: 'Tuesday Blues', date: '2025-06-03' },
                ],
            },
            {
                title: 'Project Notes',
                entries: [
                    { name: 'Kickoff Meeting', date: '2025-05-10' },
                    { name: 'First Prototype', date: '2025-05-18' },
                    { name: 'Feedback Round', date: '2025-05-25' },
                ],
            },
        ];
    return { 
        friendInfo: info, 
        friendJournals: journals
    };
    
};