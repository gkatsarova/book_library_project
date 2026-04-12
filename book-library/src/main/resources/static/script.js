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
            
            const isAdmin = user.isAdmin === true;
            if (profileLink && !isAdmin) profileLink.classList.remove('hidden');
            else if (profileLink) profileLink.classList.add('hidden');
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

const bookUI = {
    generateCard(book) {
        return `
        <div class="card book-card" style="display: flex; flex-direction: column; height: 320px; padding: 1.5rem; margin-bottom: 0;">
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-shrink: 0;">
                <div style="width: 90px; height: 130px; background: #eee; border-radius: 8px; overflow: hidden; position: relative; flex-shrink: 0;">
                    ${book.coverImageUrl 
                        ? `<img src="${book.coverImageUrl}" style="width: 100%; height: 100%; object-fit: contain;">` 
                        : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"><i class="fas fa-book fa-2x" style="color: var(--primary);"></i></div>`}
                </div>

                <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" title="${book.title}">${book.title}</h3>
                    
                    <div class="meta" style="font-size: 0.85rem; color: var(--muted-foreground); display: flex; flex-direction: column; gap: 0.2rem;">
                        <a href="author-books.html?id=${book.authorId}&name=${encodeURIComponent(book.authorName)}" style="color: inherit; text-decoration: underline;">By ${book.authorName}</a>
                        <span>ISBN: ${book.isbn}</span>
                    </div>
                    
                    <div style="margin-top: auto; padding-top: 0.5rem;">
                        <span class="badge ${book.available ? 'badge-success' : 'badge-danger'}" style="font-size: 0.70rem;">
                            ${book.available ? 'Available' : 'Rented'}
                        </span>
                    </div>
                </div>
            </div>

            <p style="flex-grow: 1; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; margin-bottom: 1rem; font-size: 0.95rem; color: var(--foreground);">
                ${book.description || 'No description available'}
            </p>

            <div style="display: flex; gap: 0.5rem; margin-top: auto; flex-shrink: 0;">
                <button class="btn btn-sm btn-outline" style="flex: ${book.available ? '1' : '100%'};" onclick="location.href='book-details.html?id=${book.id}'">Details</button>
                ${book.available ? `
                <div class="user-only hidden" style="flex: 1;">
                    <button class="btn btn-sm" style="width: 100%;" onclick="rentals.showRentModal(${book.id}, '${book.title.replace(/'/g, "\\'")}')">Rent</button>
                </div>
                ` : ''}
            </div>
        </div>
        `;
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
            list.innerHTML = books.slice(-3).reverse().map(book => bookUI.generateCard(book)).join('') || '<p>No books added yet.</p>';
        } catch (e) { list.innerHTML = 'Error loading books.'; }
    }
};

const books = {
    async loadAll() {
        const list = document.getElementById('books-list');
        if (!list) return;
        const data = await api.get('/api/books') || [];
        list.innerHTML = data.map(book => bookUI.generateCard(book)).join('') || '<p>No books found.</p>';
        await ui.updateAuthLinks();
    },
    async loadAuthorsForSelect() {
        const select = document.getElementById('book-author');
        if (select) {
            const authors = await api.get('/api/authors') || [];
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
    async delete(id, redirect = false) {
        if (confirm('Delete this book?')) {
            try {
                await api.delete('/api/books/' + id);
                if (redirect) {
                    window.location.href = 'books.html';
                } else {
                    books.loadAll();
                }
            } catch (err) { alert(err.message); }
        }
    }
};

const authors = {
    async loadAll() {
        const list = document.getElementById('authors-list');
        if (!list) return;
        const data = await api.get('/api/authors') || [];
        list.innerHTML = data.map(author => `
            <div class="card" style="cursor: pointer;" onclick="location.href='author-books.html?id=${author.id}&name=${encodeURIComponent(author.name)}'">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                    <i class="fas fa-user-edit" style="color: var(--primary); font-size: 1.25rem;"></i>
                    <h3 style="margin: 0;">${author.name}</h3>
                </div>
                <p>${author.biography || 'No biography available.'}</p>
                <div class="admin-only hidden flex-gap" style="margin-top: 1rem;">
                    <button class="btn" onclick="event.stopPropagation(); authors.edit(${author.id})">Edit</button>
                    <button class="btn btn-outline" onclick="event.stopPropagation(); authors.delete(${author.id})">Delete</button>
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
            <div class="card" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="location.href='category-books.html?id=${cat.id}&name=${encodeURIComponent(cat.name)}'">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <i class="fas fa-tag" style="color: var(--primary); font-size: 1.25rem;"></i>
                    <h3 style="margin: 0;">${cat.name}</h3>
                </div>
                <button class="btn btn-outline btn-sm admin-only hidden" style="width: auto;" onclick="event.stopPropagation(); categories.delete(${cat.id})">Delete</button>
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

const categoryBooksPage = {
    async load(categoryId, categoryName) {
        const title = document.getElementById('category-title');
        const list  = document.getElementById('category-books-list');
        if (title) title.textContent = categoryName || 'Category';
        if (!list)  return;
        try {
            const data = await api.get(`/api/books/category/${categoryId}`) || [];
            list.innerHTML = data.length ? data.map(book => bookUI.generateCard(book)).join('')
            : '<p style="color: var(--muted-foreground);">No books found in this category.</p>';
        } catch(e) {
            list.innerHTML = '<p>Error loading books.</p>';
        }
        await ui.updateAuthLinks();
    }
};

const authorBooksPage = {
    async load(authorId, authorName) {
        const title = document.getElementById('author-title');
        const list  = document.getElementById('author-books-list');
        if (title) title.textContent = authorName || 'Author';
        if (!list)  return;
        try {
            const data = await api.get(`/api/books/author/${authorId}`) || [];
            list.innerHTML = data.length ? data.map(book => bookUI.generateCard(book)).join('')
            : '<p style="color: var(--muted-foreground);">No books found for this author.</p>';
        } catch(e) {
            list.innerHTML = '<p>Error loading books.</p>';
        }
        await ui.updateAuthLinks();
    }
};

const users = {
    async loadAll() {
        const body = document.getElementById('user-list-body');
        if (!body) return;
        try {
            const [data, currentUser] = await Promise.all([
                api.get('/api/users'),
                auth.getCurrentUser()
            ]);
            
            body.innerHTML = (data || []).map(u => `
                <tr>
                    <td style="padding: 1rem;">${u.firstName} ${u.lastName}</td>
                    <td style="padding: 1rem;">${u.email}</td>
                    <td style="padding: 1rem;">${u.roles.join(', ')}</td>
                    <td style="padding: 1rem; display: flex; gap: 0.5rem;">
                        ${(currentUser && currentUser.id === u.id) ? 
                            '<span class="badge badge-outline">You (Admin)</span>' : 
                            `
                            <button class="btn btn-sm btn-outline" onclick="location.href='user-details.html?id=${u.id}'">View</button>
                            <button class="btn btn-sm btn-destructive" onclick="users.delete(${u.id})">Delete</button>
                            `
                        }
                    </td>
                </tr>
            `).join('') || '<tr><td colspan="4" style="padding: 2rem; text-align: center;">No users found.</td></tr>';
        } catch (e) { 
            console.error('User list error', e);
            body.innerHTML = '<tr><td colspan="4" style="padding: 2rem; text-align: center; color: var(--destructive);">Access Denied</td></tr>'; 
        }
    },
    async delete(id) {
        if (confirm('Are you sure you want to delete this user? All their rental history and profile data will be removed.')) {
            try {
                const res = await fetch('/api/users/' + id, { method: 'DELETE' });
                if (res.ok) {
                    alert('User deleted successfully!');
                    this.loadAll();
                } else {
                    alert('Failed to delete user.');
                }
            } catch (err) { alert(err.message); }
        }
    }
};

const adminDetails = {
    async load(userId) {
        const rentalsList = document.getElementById('detail-rentals-list');
        const historyList = document.getElementById('detail-history-list');
        try {
            const [user, userRentals] = await Promise.all([
                api.get('/api/users/' + userId),
                api.get('/api/rentals/user/' + userId)
            ]);

            document.getElementById('detail-user-name').textContent = `${user.firstName} ${user.lastName}'s Profile`;
            document.getElementById('detail-user-email').textContent = user.email;

            // Active Rentals
            const active = userRentals.filter(r => r.status === 'ACTIVE');
            if (active.length > 0) {
                rentalsList.innerHTML = active.map(r => `
                    <div class="card" style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0;">${r.bookTitle}</h4>
                            <div class="meta">Due: ${new Date(r.returnDate).toLocaleDateString()}</div>
                        </div>
                        <span class="badge badge-primary">Active</span>
                    </div>
                `).join('');
            } else {
                rentalsList.innerHTML = '<p>No active rentals.</p>';
            }

            // History
            const history = userRentals.filter(r => r.status === 'RETURNED');
            if (history.length > 0) {
                historyList.innerHTML = history.map(r => `
                    <div class="card" style="margin-bottom: 1rem; opacity: 0.8; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0;">${r.bookTitle}</h4>
                            <div class="meta">Rented: ${new Date(r.rentalDate).toLocaleDateString()} | Returned: ${new Date(r.actualReturnDate).toLocaleDateString()}</div>
                            ${r.fine > 0 ? `<div style="color: var(--destructive); font-weight: 600;">Fine Paid: ${r.fine.toFixed(2)} EUR</div>` : ''}
                        </div>
                        <span class="badge">Returned</span>
                    </div>
                `).join('');
            } else {
                historyList.innerHTML = '<p>No history.</p>';
            }
        } catch (e) {
            console.error('Error loading details:', e);
            rentalsList.innerHTML = '<p style="color: var(--destructive);">Failed to load user details.</p>';
        }
    }
};

const bookDetailsPage = {
    async load(bookId) {
        const historySection = document.getElementById('admin-book-history-section');
        const historyList = document.getElementById('book-history-list');
        
        try {
            const currentUser = await auth.getCurrentUser();
            const book = await api.get('/api/books/' + bookId);
            
            // Populate Basic Info
            document.getElementById('detail-book-title').textContent = book.title;
            const authorDetail = document.getElementById('detail-book-author');
            if (authorDetail) {
                authorDetail.innerHTML = `<a href="author-books.html?id=${book.authorId}&name=${encodeURIComponent(book.authorName)}" style="color: inherit; text-decoration: underline;">By ${book.authorName}</a>`;
            }
            document.getElementById('detail-book-isbn').textContent = `ISBN: ${book.isbn}`;
            document.getElementById('detail-book-description').textContent = book.description || 'No description available.';
            
            if (book.coverImageUrl) {
                const coverContainer = document.getElementById('detail-book-cover');
                if (coverContainer) {
                    coverContainer.innerHTML = `<img src="${book.coverImageUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
                }
            }

            const statusBadge = document.getElementById('detail-book-status');
            statusBadge.className = `badge ${book.available ? 'badge-success' : 'badge-danger'}`;
            statusBadge.textContent = book.available ? 'Available' : 'Rented';

            // Handle Rent Button for Users
            const rentBtn = document.getElementById('detail-rent-btn');
            if (rentBtn) {
                if (book.available && currentUser && !currentUser.isAdmin) {
                    rentBtn.onclick = () => rentals.showRentModal(book.id, book.title);
                } else {
                    const detailActions = document.getElementById('detail-actions');
                    if (detailActions && (!currentUser || currentUser.isAdmin)) {
                        detailActions.classList.add('hidden');
                    }
                }
            }

            // Handle Admin Actions
            const adminActions = document.getElementById('detail-admin-actions');
            if (adminActions) {
                if (currentUser && currentUser.isAdmin) {
                    adminActions.classList.remove('hidden');
                    adminActions.innerHTML = `
                        <button class="btn" onclick="books.edit(${book.id})">Edit Book</button>
                        <button class="btn btn-destructive" onclick="books.delete(${book.id}, true)">Delete Book</button>
                    `;
                } else {
                    adminActions.classList.add('hidden');
                }
            }

            // Load History for Admins
            if (currentUser && currentUser.isAdmin && historySection) {
                historySection.classList.remove('hidden');
                const historyData = await api.get('/api/rentals/book/' + bookId);
                
                if (historyData && historyData.length > 0) {
                    historyList.innerHTML = historyData.map(r => `
                        <tr>
                            <td style="padding: 1rem;">${r.userName}</td>
                            <td style="padding: 1rem;">${new Date(r.rentalDate).toLocaleDateString()}</td>
                            <td style="padding: 1rem;">${new Date(r.returnDate).toLocaleDateString()}</td>
                            <td style="padding: 1rem;">
                                ${r.actualReturnDate ? new Date(r.actualReturnDate).toLocaleDateString() : 
                                    (r.status === 'RETURNED' ? '-' : '<span style="color: var(--muted-foreground);">Still active</span>')}
                            </td>
                            <td style="padding: 1rem; font-weight: ${r.fine > 0 ? '600' : 'normal'}; color: ${r.fine > 0 ? 'var(--destructive)' : 'inherit'};">
                                ${r.fine > 0 ? r.fine.toFixed(2) : '0.00'} EUR
                            </td>
                            <td style="padding: 1rem;">
                                <span class="badge ${r.status === 'ACTIVE' ? 'badge-primary' : 'badge-success'}">${r.status}</span>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    historyList.innerHTML = '<tr><td colspan="5" style="padding: 2rem; text-align: center;">No rental history found.</td></tr>';
                }
            }
            await ui.updateAuthLinks();
        } catch (e) {
            console.error('Error loading book details:', e);
            alert('Failed to load book details.');
        }
    }
};

const profile = {
    async load() {
        const user = await auth.getCurrentUser();
        if (!user) return;
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('user-name').textContent = user.firstName + ' ' + user.lastName;

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

// Form Event Listeners
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
