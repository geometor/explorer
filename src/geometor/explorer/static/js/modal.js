document.addEventListener('DOMContentLoaded', () => {
    GEOMETOR.modal = document.getElementById('modal');
    const modalContent = GEOMETOR.modal.querySelector('.modal-content');
    const closeBtn = GEOMETOR.modal.querySelector('.close-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    function openModal() {
        GEOMETOR.modal.style.display = 'block';
    }

    function closeModal() {
        GEOMETOR.modal.style.display = 'none';
        modalBody.innerHTML = ''; // Clear the body
    }

    closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target == GEOMETOR.modal) {
            closeModal();
        }
    });

    GEOMETOR.openModal = (config) => {
        modalTitle.textContent = config.title;

        const form = document.createElement('form');
        form.id = 'modal-form';

        config.fields.forEach(field => {
            const label = document.createElement('label');
            label.setAttribute('for', field.id);
            label.textContent = field.label;

            const input = document.createElement('input');
            input.setAttribute('type', field.type);
            input.setAttribute('id', field.id);
            input.setAttribute('name', field.id);
            if (field.value) {
                input.value = field.value;
            }
            if (field.required) {
                input.setAttribute('required', true);
            }

            form.appendChild(label);
            form.appendChild(input);
        });

        const submitBtn = document.createElement('button');
        submitBtn.setAttribute('type', 'submit');
        submitBtn.textContent = config.submitLabel || 'Submit';
        form.appendChild(submitBtn);

        modalBody.appendChild(form);

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            config.onSubmit(data);
            closeModal();
        });

        openModal();
    };
});
