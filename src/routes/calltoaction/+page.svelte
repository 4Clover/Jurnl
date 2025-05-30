<header>
    <nav class="navbar">
        <div class="navbar__container">
            <!-- <button>
                <div class="pajamas--hamburger"></div>
            </button> -->
            <h1 class="navbar__logo">Jurnl</h1>
            <!-- <div class="navbar__toggle" id="menu-toggle"></div> -->

            <div class="navbar__links" id="navbar-links">
                <button
                    on:click={() => (window.location.href = '/auth/login')}
                    class="primary-button button-md"
                >
                    <h3>Log In</h3>
                </button>
                <button
                    on:click={() => (window.location.href = '/auth/register')}
                    class="secondary-button button-md"
                >
                    <h3>Sign Up</h3>
                </button>
            </div>
        </div>
    </nav>
</header>

<main>
    <h1>Welcome to Jurnl.</h1>
</main>
