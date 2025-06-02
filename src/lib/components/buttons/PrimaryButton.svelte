<script>
    let {text, onClick} = $props()
</script>

<button class="primary-button" onclick={onClick}>
    <h3>{text}</h3>
</button>