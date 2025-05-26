<script lang="ts">
    import '../styles/style.css';
</script>

<nav class="navbar">
    <div class="navbar__container">
        <button>
            <div class="pajamas--hamburger"></div>
        </button>
        <div class="navbar__logo">Jurnl</div>
        <div class="navbar__toggle" id="menu-toggle"></div>
        <div class="navbar__links" id="navbar-links">
            <a href="/">Home</a>
            <a href="/login">Login</a>
            <a href="/landing">Landing</a>
            <a href="/journals">Journals</a>
            <a href="/feed">Friends' Feed</a>
            <a href="/shared">Shared Journals</a>
        </div>
    </div>
</nav>

<slot />
