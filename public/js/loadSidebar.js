document.addEventListener('DOMContentLoaded', function() {
    const sidebarContainer = document.getElementById('sidebar-container');
    
    // Mevcut sayfa URL'sini al
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Yan menü içeriğini oluştur
    const sidebarHTML = `
        <div class="sidebar">
            <div class="sidebar-header" style="display: flex; flex-direction: column; align-items: center;">
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                    <img src="images/logo.svg" alt="RoboBrew Logo" class="logo" style="margin-bottom: 10px;">
                    <h2 style="text-align: center;">RoboBrew Admin</h2>
                </div>
            </div>
            <nav class="sidebar-nav">
                <ul>
                    <li class="${currentPage === 'index.html' ? 'active' : ''}">
                        <a href="index.html">
                            <svg viewBox="0 0 24 24">
                                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                            </svg>
                            <span>Anasayfa</span>
                        </a>
                    </li>
                </ul>
            </nav>
            <div class="sidebar-footer">
                <div class="user-info">
                    <img src="images/avatar.png" alt="Kullanıcı Avatarı" class="avatar">
                    <div class="user-details">
                        <div class="user-name">Admin Kullanıcı</div>
                        <div class="user-role">Yönetici</div>
                    </div>
                </div>
                <a href="logout.html" class="logout-button">
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
}); 