document.getElementById('changePasswordForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    const messageContainer = document.getElementById('messageContainer');
    
    // UI States
    submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin align-middle mr-2">progress_activity</span> Updating...';
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
            
            // Small delay before redirecting to allow user to see success message
            setTimeout(() => {
                window.location.href = result.redirect || '/user/profile';
            }, 1500);
        } else {
            messageContainer.classList.add('bg-red-500/10', 'text-red-500', 'border-red-500/20');
            messageContainer.innerHTML = `<span class="material-symbols-outlined align-middle mr-2">error</span> ${result.message}`;
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        messageContainer.classList.remove('hidden');
        messageContainer.classList.add('bg-red-500/10', 'text-red-500', 'border', 'border-red-500/20');
        messageContainer.innerHTML = `<span class="material-symbols-outlined align-middle mr-2">error</span> An unexpected error occurred. Please try again.`;
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});
