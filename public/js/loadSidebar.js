document.addEventListener('DOMContentLoaded', function() {
    const sidebarContainer = document.getElementById('sidebar-container');
    
    // Mevcut sayfa URL'sini al
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Yolu hesapla (public/ veya public/views/ içinde olduğumuza göre)
    const isInViews = window.location.pathname.includes('/views/');
    const rootPath = isInViews ? '../' : '';
    const viewsPath = isInViews ? '' : 'views/';
    
    // Yan menü içeriğini oluştur
    const sidebarHTML = `
        <div class="sidebar">
            <div class="sidebar-header" style="display: flex; flex-direction: column; align-items: center;">
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                    <img src="${rootPath}images/logo.svg" alt="RoboBrew Logo" class="logo" style="margin-bottom: 10px;">
                    <h2 style="text-align: center;">RoboBrew Admin</h2>
                </div>
            </div>
            <nav class="sidebar-nav">
                <ul>
                    <li class="${currentPage === 'index.html' ? 'active' : ''}">
                        <a href="${rootPath}index.html">
                            <svg viewBox="0 0 24 24">
                                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                            </svg>
                            <span>Anasayfa</span>
                        </a>
                    </li>
                    <li class="${currentPage === 'products.html' ? 'active' : ''}">
                        <a href="${rootPath}${viewsPath}products.html">
                            <svg viewBox="0 0 24 24">
                                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                            </svg>
                            <span>Ürünler</span>
                        </a>
                    </li>
                    <li class="${currentPage === 'machines.html' ? 'active' : ''}">
                        <a href="${rootPath}${viewsPath}machines.html">
                            <svg viewBox="0 0 24 24">
                                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                            <span>Makineler</span>
                        </a>
                    </li>
                    <li class="${currentPage === 'orders.html' ? 'active' : ''}">
                        <a href="${rootPath}${viewsPath}orders.html">
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
                <a href="${rootPath}${viewsPath}loginview.html" class="logout-button" id="logout-btn">
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
    
    // Firebase oturumunu kontrol et ve çıkış butonuna olay dinleyicisi ekle
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn && typeof firebase !== 'undefined' && firebase.auth) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            firebase.auth().signOut().then(() => {
                window.location.href = `${rootPath}${viewsPath}loginview.html`;
            }).catch((error) => {
                console.error('Çıkış yaparken hata oluştu:', error);
            });
        });
    }
}); 