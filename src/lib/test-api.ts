export async function testApiRoutes() {
    const tests = [
        { method: 'GET', path: '/api/journals', description: 'List journals' },
        { method: 'POST', path: '/api/journals', description: 'Create journal', body: { title: 'Test Journal' } },
        { method: 'GET', path: '/api/journals/[id]', description: 'Get specific journal' },
        { method: 'PUT', path: '/api/journals/[id]', description: 'Update journal', body: { title: 'Updated' } },
        { method: 'GET', path: '/api/journals/[id]/entries', description: 'List entries' },
        { method: 'POST', path: '/api/journals/[id]/entries', description: 'Create entry', body: {
                title: 'Test Entry',
                content_zones: {
                    picture_text: { image: { url: null, alt: '', caption: '' }, text: '' },
                    list: { items: [] },
                    text_right: { content: '' }
                },
                free_form_content: 'Test content'
            }},
        { method: 'GET', path: '/api/stats', description: 'Get stats' },
    ];

    console.log('🧪 Testing API routes...\n');

    for (const test of tests) {
        try {
            const options: RequestInit = {
                method: test.method,
                headers: { 'Content-Type': 'application/json' },
            };

            if (test.body) {
                options.body = JSON.stringify(test.body);
            }

            // For tests with [id], you'll need to replace with actual IDs
            const url = test.path.includes('[id]')
                ? test.path.replace('[id]', 'YOUR_JOURNAL_ID_HERE')
                : test.path;

            const response = await fetch(url, options);

            console.log(
                response.ok ? '✅' : '❌',
                `${test.method} ${test.path}`,
                `(${response.status})`,
                '-',
                test.description
            );

            if (!response.ok && response.status !== 401) {
                const error = await response.text();
                console.log('   Error:', error);
            }
        } catch (error) {
            console.log('❌', `${test.method} ${test.path}`, '- Network error');
        }
    }

    console.log('\n✨ API route testing complete!');
}