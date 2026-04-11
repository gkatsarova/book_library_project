const api = {
    async get(url) {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.status === 401) return null;
        if (!res.ok) {
            console.error(`API Error: ${res.status} ${res.statusText} at ${url}`);
            try {
                const errData = await res.json();
                console.error('API Error details:', errData);
            } catch (e) {}
            throw new Error('API Error');
        }
        return res.json();
    },
    async post(url, data) {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            cache: 'no-store'
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Post failed');
        }
        return res.json();
    },
    async put(url, data) {
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            cache: 'no-store'
        });
        if (!res.ok) throw new Error('Update failed');
        return res.json();
    },
    async delete(url) {
        const res = await fetch(url, { method: 'DELETE', cache: 'no-store' });
        return res.ok;
    }
};

const auth = {
    async getCurrentUser() {
        return await api.get('/api/users/me');
    },
    logout() {
        window.location.href = '/logout';
    }
};

const ui = {
    async updateAuthLinks() {
        const user = await auth.getCurrentUser();
        // Diagnostic log
        console.log('DEBUG: Current User session data:', user);
        
        const loginLink = document.getElementById('login-link');
        const logoutLink = document.getElementById('logout-link');
        const profileLink = document.getElementById('profile-link');
        
        if (user) {
            if (loginLink) loginLink.classList.add('hidden');
            if (logoutLink) logoutLink.classList.remove('hidden');
            if (profileLink) profileLink.classList.remove('hidden');

            const isAdmin = user.isAdmin === true;
            document.querySelectorAll('.admin-only').forEach(el => {
                if (isAdmin) {
                    el.classList.remove('hidden');
                    if (el.tagName === 'DIV' || el.tagName === 'LI') {
                        el.style.display = '';
                        if (el.id === 'add-book-container' || el.classList.contains('flex-gap-container')) {
                             el.classList.add('flex-gap');
                        }
                    }
                } else {
                    el.classList.add('hidden');
                    el.classList.remove('flex-gap');
                }
            });
            document.querySelectorAll('.user-only').forEach(el => {
                if (!isAdmin) el.classList.remove('hidden');
                else el.classList.add('hidden');
            });
        } else {
            if (loginLink) loginLink.classList.remove('hidden');
            if (logoutLink) logoutLink.classList.add('hidden');
            if (profileLink) profileLink.classList.add('hidden');
            document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.user-only').forEach(el => el.classList.add('hidden'));
        }
    },
    showModal(id) {
        document.getElementById(id).classList.remove('hidden');
    },
    hideModal(id) {
        document.getElementById(id).classList.add('hidden');
    },
    showAlert(id, message, type = 'danger') {
        const alert = document.getElementById(id);
        if (!alert) return;
        alert.className = `alert alert-${type} visible`;
        const span = alert.querySelector('span');
        if (span) span.textContent = message;
        setTimeout(() => alert.classList.remove('visible'), 5000);
    }
};

const rentals = {
    async rent(bookId, returnDate) {
        return await api.post('/api/rentals/rent', { bookId, returnDate });
    },
    async getMy() {
        return await api.get('/api/rentals/my') || [];
    },
    async getAll() {
        return await api.get('/api/rentals/all') || [];
    },
    async return(id) {
        return await api.post(`/api/rentals/return/${id}`, {});
    },
    showRentModal(bookId, bookTitle) {
        document.getElementById('rental-book-id').value = bookId;
        document.getElementById('rental-book-title').textContent = bookTitle;
        
        // Set min date to today
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        document.getElementById('return-date').setAttribute('min', today);
        document.getElementById('return-date').value = today; // Default to today

        ui.showModal('rental-modal');
    }
};

const dashboard = {
    async loadStats() {
        try {
            const b = await api.get('/api/books') || [];
            const a = await api.get('/api/authors') || [];
            const c = await api.get('/api/categories') || [];
            if (document.getElementById('total-books')) document.getElementById('total-books').textContent = b.length;
            if (document.getElementById('total-authors')) document.getElementById('total-authors').textContent = a.length;
            if (document.getElementById('total-categories')) document.getElementById('total-categories').textContent = c.length;
        } catch (e) { console.error('Stats error', e); }
    },
    async loadRecentBooks() {
        const list = document.getElementById('recent-books-list');
        if (!list) return;
        try {
            const books = await api.get('/api/books') || [];
            list.innerHTML = books.slice(-3).reverse().map(book => `
                <div class="card">
                    <div style="height: 200px; background: #eee; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; border-radius: 8px; overflow: hidden;">
                        ${book.coverImageUrl ? `<img src="${book.coverImageUrl}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i class="fas fa-book fa-3x" style="color: var(--primary);"></i>`}
                    </div>
                    <h3>${book.title}</h3>
                    <div class="meta">By ${book.authorName}</div>
                    <p>${book.description ? book.description.substring(0, 100) + '...' : 'No description'}</p>
                </div>
            `).join('') || '<p>No books added yet.</p>';
        } catch (e) { list.innerHTML = 'Error loading books.'; }
    }
};

const books = {
    async loadAll() {
        const list = document.getElementById('books-list');
        if (!list) return;
        const data = await api.get('/api/books') || [];
        list.innerHTML = data.map(book => `
            <div class="card" style="display: flex; gap: 1.5rem; align-items: start;">
                <div style="width: 100px; height: 140px; background: #eee; flex-shrink: 0; border-radius: 4px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    ${book.coverImageUrl ? `<img src="${book.coverImageUrl}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i class="fas fa-book fa-3x" style="color: var(--primary);"></i>`}
                </div>
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <h3 style="margin-top: 0;">${book.title}</h3>
                        <span class="badge ${book.available ? 'badge-success' : 'badge-danger'}">
                            ${book.available ? 'Available' : 'Rented'}
                        </span>
                    </div>
                    <div class="meta">By ${book.authorName} | ISBN: ${book.isbn}</div>
                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                        <span class="user-only hidden">
                            ${book.available ? `<button class="btn btn-sm" onclick="rentals.showRentModal(${book.id}, '${book.title.replace(/'/g, "\\'")}')">Rent</button>` : ''}
                        </span>
                        <div class="admin-only hidden flex-gap">
                            <button class="btn btn-sm" onclick="books.edit(${book.id})">Edit</button>
                            <button class="btn btn-sm btn-outline" onclick="books.delete(${book.id})">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('') || '<p>No books found.</p>';
        await ui.updateAuthLinks();
    },
    async loadAuthorsForSelect() {
        const authors = await api.get('/api/authors') || [];
        const select = document.getElementById('book-author');
        if (select) {
            select.innerHTML = '<option value="">Select Author</option>' + 
                authors.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
        }
    },
    async edit(id) {
        const book = await api.get('/api/books/' + id);
        document.getElementById('book-id').value = book.id;
        document.getElementById('book-title').value = book.title;
        document.getElementById('book-author').value = book.authorId;
        document.getElementById('book-isbn').value = book.isbn;
        document.getElementById('book-cover').value = book.coverImageUrl || '';
        document.getElementById('book-categories').value = book.categoryNames ? Array.from(book.categoryNames).join(', ') : '';
        document.getElementById('book-description').value = book.description;
        ui.showModal('book-modal');
    },
    async delete(id) {
        if (confirm('Delete this book?')) {
            await api.delete('/api/books/' + id);
            books.loadAll();
        }
    }
};

const authors = {
    async loadAll() {
        const list = document.getElementById('authors-list');
        if (!list) return;
        const data = await api.get('/api/authors') || [];
        list.innerHTML = data.map(author => `
            <div class="card">
                <h3>${author.name}</h3>
                <p>${author.biography || 'No biography available.'}</p>
                <div class="admin-only hidden flex-gap" style="margin-top: 1rem;">
                    <button class="btn" onclick="authors.edit(${author.id})">Edit</button>
                    <button class="btn btn-outline" onclick="authors.delete(${author.id})">Delete</button>
                </div>
            </div>
        `).join('') || '<p>No authors found.</p>';
        await ui.updateAuthLinks();
    },
    async edit(id) {
        const author = await api.get('/api/authors/' + id);
        document.getElementById('author-id').value = author.id;
        document.getElementById('author-name').value = author.name;
        document.getElementById('author-biography').value = author.biography;
        ui.showModal('author-modal');
    },
    async delete(id) {
        if (confirm('Delete this author?')) {
            await api.delete('/api/authors/' + id);
            authors.loadAll();
        }
    },
    clearForm() {
        document.getElementById('author-id').value = '';
        document.getElementById('author-name').value = '';
        document.getElementById('author-biography').value = '';
    }
};

const categories = {
    async loadAll() {
        const list = document.getElementById('categories-list');
        if (!list) return;
        const data = await api.get('/api/categories') || [];
        list.innerHTML = data.map(cat => `
            <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0;">${cat.name}</h3>
                <button class="btn btn-outline admin-only hidden" style="width: auto;" onclick="categories.delete(${cat.id})">Delete</button>
            </div>
        `).join('') || '<p>No categories found.</p>';
        await ui.updateAuthLinks();
    },
    async delete(id) {
        if (confirm('Delete this category?')) {
            await api.delete('/api/categories/' + id);
            categories.loadAll();
        }
    }
};

const users = {
    async loadAll() {
        const body = document.getElementById('user-list-body');
        if (!body) return;
        try {
            const data = await api.get('/api/users') || [];
            body.innerHTML = data.map(u => `
                <tr>
                    <td style="padding: 1rem;">${u.firstName} ${u.lastName}</td>
                    <td style="padding: 1rem;">${u.email}</td>
                    <td style="padding: 1rem;">${u.roles.join(', ')}</td>
                </tr>
            `).join('') || '<tr><td colspan="3" style="padding: 2rem; text-align: center;">No users found.</td></tr>';
        } catch (e) { 
            console.error('User list error', e);
            body.innerHTML = '<tr><td colspan="3" style="padding: 2rem; text-align: center; color: var(--destructive);">Access Denied</td></tr>'; 
        }
    }
};

const profile = {
    async load() {
        const user = await auth.getCurrentUser();
        if (!user) return;
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('user-name').textContent = user.firstName + ' ' + user.lastName;
        if (user.profile) {
            document.getElementById('profile-phone').value = user.profile.phoneNumber || '';
            document.getElementById('profile-address').value = user.profile.address || '';
            document.getElementById('profile-birth').value = user.profile.birthDate || '';
        }

        // Load Rentals
        const rentalsList = document.getElementById('my-rentals-list');
        const historyList = document.getElementById('my-history-list');
        if (rentalsList && historyList) {
            try {
                const myRentals = await rentals.getMy();
                
                // Active Rentals (status is 'ACTIVE')
                const activeRentals = myRentals.filter(r => r.status === 'ACTIVE');
                if (activeRentals.length > 0) {
                    const now = new Date();
                    now.setHours(0,0,0,0);
                    
                    rentalsList.innerHTML = activeRentals.map(r => {
                        const dueDate = new Date(r.returnDate);
                        dueDate.setHours(0,0,0,0);
                        const isLate = now > dueDate;
                        let fineInfo = '';
                        
                        if (isLate) {
                            const diffTime = Math.abs(now - dueDate);
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            const projectedFine = (diffDays * 1.00).toFixed(2);
                            fineInfo = `<span class="badge badge-danger" style="margin-left: 0.5rem;">LATE - Fine: ${projectedFine} EUR</span>`;
                        }

                        return `
                            <div class="card" style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid ${isLate ? 'var(--destructive)' : 'var(--primary)'}">
                                <div>
                                    <h4 style="margin: 0;">${r.bookTitle} ${fineInfo}</h4>
                                    <div class="meta">Due: ${dueDate.toLocaleDateString()}</div>
                                </div>
                                <button class="btn btn-sm btn-outline" onclick="profile.returnBook(${r.id})">Return</button>
                            </div>
                        `;
                    }).join('');
                } else {
                    rentalsList.innerHTML = '<p style="color: var(--muted-foreground);">No active rentals.</p>';
                }

                // History (status is 'RETURNED')
                const returnedRentals = myRentals.filter(r => r.status === 'RETURNED');
                if (returnedRentals.length > 0) {
                    historyList.innerHTML = returnedRentals.map(r => `
                        <div class="card" style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; opacity: 0.8;">
                            <div>
                                <h4 style="margin: 0;">${r.bookTitle}</h4>
                                <div class="meta">Rented: ${new Date(r.rentalDate).toLocaleDateString()} | Returned: ${new Date(r.actualReturnDate).toLocaleDateString()}</div>
                                ${r.fine > 0 ? `<div style="color: var(--destructive); font-weight: 600; font-size: 0.85rem;">Fine Paid: ${r.fine.toFixed(2)} EUR</div>` : ''}
                            </div>
                            <span class="badge badge-success">Returned</span>
                        </div>
                    `).join('');
                } else {
                    historyList.innerHTML = '<p style="color: var(--muted-foreground);">No rental history.</p>';
                }
            } catch (e) {
                console.error('Error loading rentals:', e);
                rentalsList.innerHTML = '<p style="color: var(--destructive);">Error loading rentals.</p>';
            }
        }
    },
    async returnBook(rentalId) {
        if (confirm('Are you sure you want to return this book?')) {
            try {
                await rentals.return(rentalId);
                alert('Book returned successfully!');
                profile.load();
            } catch (err) {
                alert(err.message);
            }
        }
    }
};

// Form Event Listeners (Unified)
document.addEventListener('submit', async (e) => {
    if (e.target.id === 'registrationForm') {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));
        if (data.password !== data.confirmPassword) {
            ui.showAlert('errorAlert', 'Passwords do not match');
            return;
        }
        try {
            await api.post('/register', data);
            ui.showAlert('successAlert', 'Registration successful! Redirecting to login...', 'success');
            setTimeout(() => window.location.href = 'login.html', 2000);
        } catch (err) { ui.showAlert('errorAlert', err.message); }
    }

    if (e.target.id === 'author-form') {
        e.preventDefault();
        const id = document.getElementById('author-id').value;
        const data = {
            name: document.getElementById('author-name').value,
            biography: document.getElementById('author-biography').value
        };
        try {
            if (id) await api.put('/api/authors/' + id, data);
            else await api.post('/api/authors', data);
            ui.hideModal('author-modal');
            authors.loadAll();
        } catch (err) { alert(err.message); }
    }

    if (e.target.id === 'book-form') {
        e.preventDefault();
        const id = document.getElementById('book-id').value;
        const data = {
            title: document.getElementById('book-title').value,
            authorId: document.getElementById('book-author').value,
            isbn: document.getElementById('book-isbn').value,
            coverImageUrl: document.getElementById('book-cover').value,
            categoryNames: document.getElementById('book-categories').value.split(',').map(s => s.trim()).filter(s => s !== ''),
            description: document.getElementById('book-description').value
        };
        try {
            if (id) await api.put('/api/books/' + id, data);
            else await api.post('/api/books', data);
            ui.hideModal('book-modal');
            books.loadAll();
        } catch (err) { alert(err.message); }
    }

    if (e.target.id === 'category-form') {
        e.preventDefault();
        const data = { name: document.getElementById('category-name').value };
        try {
            await api.post('/api/categories', data);
            ui.hideModal('category-modal');
            categories.loadAll();
        } catch (err) { alert(err.message); }
    }

    if (e.target.id === 'profile-form') {
        e.preventDefault();
        const data = {
            phoneNumber: document.getElementById('profile-phone').value,
            address: document.getElementById('profile-address').value,
            birthDate: document.getElementById('profile-birth').value
        };
        try {
            await api.put('/api/users/me/profile', data);
            alert('Profile updated successfully!');
        } catch (err) { alert(err.message); }
    }

    if (e.target.id === 'rental-form') {
        e.preventDefault();
        const bookId = document.getElementById('rental-book-id').value;
        const returnDate = document.getElementById('return-date').value;
        try {
            await rentals.rent(bookId, returnDate);
            ui.hideModal('rental-modal');
            alert('Book rented successfully!');
            books.loadAll();
        } catch (err) { alert(err.message); }
    }
});
