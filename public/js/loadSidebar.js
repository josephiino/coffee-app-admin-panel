document.addEventListener('DOMContentLoaded', function() {
    const sidebarContainer = document.getElementById('sidebar-container');
    
    // Mevcut sayfa URL'sini al
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Yan menü içeriğini oluştur
    const sidebarHTML = `
        <div class="sidebar">
            <div class="sidebar-header">
                <img src="images/logo.svg" alt="RoboBrew Logo" class="logo">
                <h2>RoboBrew Admin</h2>
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
                    <li class="${currentPage === 'devices.html' ? 'active' : ''}">
                        <a href="devices.html">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                            </svg>
                            <span>Cihazlar</span>
                        </a>
                    </li>
                    <li class="${currentPage === 'orders.html' ? 'active' : ''}">
                        <a href="orders.html">
                            <svg viewBox="0 0 24 24">
                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                            </svg>
                            <span>Siparişler</span>
                        </a>
                    </li>
                    <li class="${currentPage === 'inventory.html' ? 'active' : ''}">
                        <a href="inventory.html">
                            <svg viewBox="0 0 24 24">
                                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                            </svg>
                            <span>Envanter</span>
                        </a>
                    </li>
                    <li class="${currentPage === 'reports.html' ? 'active' : ''}">
                        <a href="reports.html">
                            <svg viewBox="0 0 24 24">
                                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                            </svg>
                            <span>Raporlar</span>
                        </a>
                    </li>
                    <li class="${currentPage === 'settings.html' ? 'active' : ''}">
                        <a href="settings.html">
                            <svg viewBox="0 0 24 24">
                                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            <span>Ayarlar</span>
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