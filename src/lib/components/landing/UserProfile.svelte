<script lang="ts">
    import type { UserProfileProps } from '$lib/types/landing.types';
    const props = $props();

    const userInfo = props.userInfo ?? {
        username: 'Daryl',
        bio_text:
            "I love to cook in my free time and I want to start gardening sometime soon. I have a huge house that is not managed so I probably want to work on that as well... But that's all I want, what do I actually do?",
        bio_image_url:
            'https://i.pinimg.com/736x/7f/c6/24/7fc62415024ac0f80b6db0fac7a32863.jpg',
    };
</script>

<h2>{userInfo.username}</h2>

<div class="user-profile-contents">
    <img
        class="user-profile-image"
        src={userInfo.bio_image_url ?? 'https://i.pinimg.com/736x/7f/c6/24/7fc62415024ac0f80b6db0fac7a32863.jpg'}
        alt="An image of the user."
        width="500"
        height="372"
    />
    <p class="user-profile-description">{userInfo.bio_text ?? "I love to cook in my free time and I want to start gardening sometime soon. I have a huge house that is not managed so I probably want to work on that as well... But that's all I want, what do I actually do?"}</p>
</div>
