document.getElementById('changeEmailForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    const messageContainer = document.getElementById('messageContainer');
    
    submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Sending...';
    submitBtn.disabled = true;
    messageContainer.classList.add('hidden');

    try {
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());

        const response = await fetch(this.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        messageContainer.classList.remove('hidden', 'bg-red-500/10', 'text-red-500', 'border-red-500/20', 'bg-green-500/10', 'text-green-500', 'border-green-500/20');
        messageContainer.classList.add('border');
        
        if (result.success) {
            messageContainer.classList.add('bg-green-500/10', 'text-green-500', 'border-green-500/20');
            messageContainer.innerHTML = `<span class="material-symbols-outlined align-middle mr-2">check_circle</span> ${result.message}`;
            this.reset();
        } else {
            messageContainer.classList.add('bg-red-500/10', 'text-red-500', 'border-red-500/20');
            messageContainer.innerHTML = `<span class="material-symbols-outlined align-middle mr-2">error</span> ${result.message}`;
        }
    } catch (error) {
        console.error('Error:', error);
        messageContainer.classList.remove('hidden');
        messageContainer.classList.add('bg-red-500/10', 'text-red-500', 'border', 'border-red-500/20');
        messageContainer.innerHTML = `<span class="material-symbols-outlined align-middle mr-2">error</span> An unexpected error occurred. Please try again.`;
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});
