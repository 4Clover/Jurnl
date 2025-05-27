<script lang="ts">
    let email = $state('');
    let password = $state('');
</script>

<main class="center-container">
    <div class="login-box">
        <div class="spacing"></div>
        <h2 class="center_item">Log In to View Your Journal</h2>
        <div class="center_item">
            <h4 class="label">Email Address</h4>
            <input class="fieldbox" bind:value={email} />
        </div>
        <div class="center_item">
            <h4 class="label">Password</h4>
            <input
                type="password"
                id="password"
                name="password"
                class="fieldbox"
                bind:value={password}
            />
        </div>
        <div class="center_item">
            <button class="primary-button button-sm"> Continue </button>
        </div>
    </div>
</main>
