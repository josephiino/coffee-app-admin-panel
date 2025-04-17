document.addEventListener('DOMContentLoaded', function() {
    const sidebarContainer = document.getElementById('sidebar-container');
    
    // Mevcut sayfa URL'sini al
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const currentPath = window.location.pathname; // Get full path e.g., /views/machines.html or /index.html

    // Yolu hesapla (asset'ler için)
    const isInViews = currentPath.includes('/views/');
    const rootPath = isInViews ? '../' : ''; // For assets relative to current dir

    // Link hedeflerini kök dizine göre belirle
    const indexLink = '/index.html';
    const productsLink = '/views/products.html';
    const machinesLink = '/views/machines.html';
    const ordersLink = '/views/orders.html';

    // Aktif linki belirlemek için kullanılacak sayfa adları
    const indexPageName = 'index.html';
    const productsPageName = 'products.html';
    const machinesPageName = 'machines.html';
    const ordersPageName = 'orders.html';
    
    // Yan menü içeriğini oluştur
    const sidebarHTML = `
        <div class="sidebar">
            <div class="sidebar-header">
                <div class="logo-container">
                    <img src="${rootPath}images/logo.svg" alt="RoboBrew Logo" class="logo">
                    <h2>RoboBrew Admin</h2>
                </div>
            </div>
            <nav class="sidebar-nav">
                <ul>
                    <li class="${currentPage === indexPageName ? 'active' : ''}">
                        <a href="${indexLink}">
                            <svg viewBox="0 0 24 24">
                                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                            </svg>
                            <span>Anasayfa</span>
                        </a>
                    </li>
                    <li class="${currentPage === productsPageName ? 'active' : ''}">
                        <a href="${productsLink}">
                            <svg viewBox="0 0 24 24">
                                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                            </svg>
                            <span>Ürünler</span>
                        </a>
                    </li>
                    <li class="${currentPage === machinesPageName ? 'active' : ''}">
                        <a href="${machinesLink}">
                            <svg viewBox="0 0 24 24">
                                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                            <span>Makineler</span>
                        </a>
                    </li>
                    <li class="${currentPage === ordersPageName ? 'active' : ''}">
                        <a href="${ordersLink}">
                            <svg viewBox="0 0 24 24">
                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                            </svg>
                            <span>Siparişler</span>
                        </a>
                    </li>
                </ul>
            </nav>
            <div class="sidebar-footer">
                <div class="user-info">
                    <img src="${rootPath}images/avatar.png" alt="Kullanıcı Avatarı" class="avatar">
                    <div class="user-details">
                        <div class="user-name">Admin Kullanıcı</div>
                        <div class="user-role">Yönetici</div>
                    </div>
                </div>
                <a href="#" class="logout-button" id="logout-btn">
                    <svg viewBox="0 0 24 24">
                        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    <span>Çıkış</span>
                </a>
            </div>
        </div>
    `;
    
    // Yan menüyü sayfaya ekle
    sidebarContainer.innerHTML = sidebarHTML;
    
    // Not: logoutBtn olay dinleyicisi auth.js tarafından yönetiliyor
}); 