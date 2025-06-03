<script lang="ts">
    import type { UserProfileProps } from '$lib/types/landing.types';

    let { userInfo }: UserProfileProps = $props();
</script>

<!-- 
<h2>[Username]</h2> -->
<h2>{userInfo.username}</h2>
<div class="user-profile-contents">
    <!--
    <img class = "user-profile-image" src= {userInfo.bio_image_url} alt="An image of the user." width="500" height="372">
    <p class="user-profile-description">{userInfo.bio_text}</p>
    -->

    <!-- IMG CREDS: Photo by Julia Iskova: https://www.pexels.com/photo/moody-portrait-of-a-woman-in-profile-view-30528308/-->
    <img
        class="user-profile-image"
        src="src/assets/user-profile-ex.jpg"
        alt="An image of the user."
        width="500"
        height="372"
    />
    <p class="user-profile-description">
        Lorem ipsum dolor sit amet consectetur adipiscing elit. Pretium tellus
        duis convallis tempus leo eu aenean. Iaculis massa nisl malesuada
        lacinia integer nunc posuere. Conubia nostra inceptos himenaeos orci
        varius natoque penatibus. Nulla molestie mattis scelerisque maximus eget
        fermentum odio. Blandit quis suspendisse aliquet nisi sodales consequat
        magna. Ligula congue sollicitudin erat viverra ac tincidunt nam. Velit
        aliquam imperdiet mollis nullam volutpat porttitor ullamcorper. Dui
        felis venenatis ultrices proin libero feugiat tristique. Cubilia curae
        hac habitasse platea dictumst lorem ipsum. Sem placerat in id cursus mi
        pretium tellus. Fringilla lacus nec metus bibendum egestas iaculis
        massa. Taciti sociosqu ad litora torquent per conubia nostra. Ridiculus
        mus donec rhoncus eros lobortis nulla molestie. Mauris pharetra
        vestibulum fusce dictum risus blandit quis. Finibus facilisis dapibus
        etiam interdum tortor ligula congue. Justo lectus commodo augue arcu
        dignissim velit aliquam.
    </p>
</div>
