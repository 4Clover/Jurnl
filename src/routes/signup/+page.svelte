<script lang="ts">
    let first = $state('');
    let last = $state('');
    let email = $state('');
    let password = $state('');
</script>

<main class="center-container">
    <div class="login-box">
        <div class="spacing"></div>
        <div class="center_item">
            <h2>Welcome to Jurnl!</h2>
            <h2>Let's get started.</h2>
        </div>
        <div class="center_item">
            <h4 class="label">First Name</h4>
            <input class="fieldbox" bind:value={first} />
        </div>
        <div class="center_item">
            <h4 class="label">Last Name</h4>
            <input class="fieldbox" bind:value={last} />
        </div>

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
            <button class="primary-button button-sm">
                <h3>Continue</h3>
            </button>
        </div>
    </div>
</main>
