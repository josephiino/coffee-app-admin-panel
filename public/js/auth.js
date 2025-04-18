console.log('[AuthCheck] auth.js starting...'); // Başlangıç log'u eklendi

/**
 * RoboBrew Admin Yetkilendirme ve Oturum Yönetimi
 */

// Sayfa yüklendiğinde çalışacak kod
document.addEventListener('DOMContentLoaded', function() {
    // Firebase yapılandırma
    const firebaseConfig = {
        apiKey: "AIzaSyDqan-ccv0ewJpRo_U3oZz8WN8-NcXAeno",
        authDomain: "robobrewbetaapp.firebaseapp.com",
        projectId: "robobrewbetaapp",
        storageBucket: "robobrewbetaapp.appspot.com",
        appId: "1:96218340172:web:38bdd8f8a3d4e0af208de9"
    };
    
    // Firebase'in daha önce başlatılıp başlatılmadığını kontrol et
    if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    // Yükleme ekranını göster/gizle
    const loadingScreen = document.getElementById('loading-screen');
    const dashboardContent = document.querySelector('.dashboard');
    
    // Şu anki sayfanın login sayfası olup olmadığını kontrol et
    const isLoginPage = window.location.pathname.endsWith('loginview.html') || window.location.pathname.endsWith('loginview');
    
    // Firebase auth state değişikliğini dinle
    firebase.auth().onAuthStateChanged(function(user) {
        console.log('[AuthCheck] Auth state changed. User:', user ? user.uid : 'null');
        const currentPath = window.location.pathname;
        console.log('[AuthCheck] Current path:', currentPath);
        const isLoginPage = currentPath.endsWith('loginview.html') || currentPath.endsWith('loginview');
        console.log('[AuthCheck] Is Login Page:', isLoginPage);

        if (user) {
            // Kullanıcı giriş yapmış
            console.log('[AuthCheck] User is logged in.');
            if (isLoginPage) {
                // Login sayfasındaysak ve kullanıcı giriş yapmışsa, ana sayfaya yönlendir
                console.log('[AuthCheck] Redirecting from Login page to Home...');
                navigateToHome();
            } else if (loadingScreen && dashboardContent) {
                // Ana sayfada veya diğer sayfalardaysa, yükleme ekranını gizle ve içeriği göster
                console.log('[AuthCheck] Showing content for logged-in user.');
                loadingScreen.style.display = 'none';
                dashboardContent.style.display = 'flex';
                
                // Kullanıcı bilgilerini güncelle
                updateUserInfo(user);
            }
        } else {
            // Kullanıcı giriş yapmamış
            console.log('[AuthCheck] User is logged out.');
            if (!isLoginPage) {
                // Login sayfasında değilsek ve kullanıcı giriş yapmamışsa, login sayfasına yönlendir (Koruma eklendi)
                console.log('[AuthCheck] Not on Login page and logged out. Redirecting to /loginview...');
                window.location.href = '/loginview';
            } else if (loadingScreen) {
                // Login sayfasındaysak, yükleme ekranını gizle
                console.log('[AuthCheck] On Login page and logged out. Hiding loading screen.');
                loadingScreen.style.display = 'none';
            }
        }
    });
    
    // Çıkış butonuna tıklanınca
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Logout button clicked');
            firebase.auth().signOut().then(() => {
                console.log('SignOut successful, redirecting...');
                window.location.href = '/loginview';
            }).catch((error) => {
                console.error('Çıkış yaparken hata oluştu:', error);
                alert('Çıkış işlemi sırasında bir hata oluştu: ' + error.message);
            });
        });
    }
    
    // Giriş formunu kontrol et
    const loginForm = document.getElementById('login-btn');
    if (loginForm) {
        // DOM elementleri
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const loginError = document.getElementById('login-error');
        const emailError = document.getElementById('email-error');
        const passwordError = document.getElementById('password-error');
        
        // Enter tuşu ile giriş yapma
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginForm.click();
            }
        });
        
        // Giriş işlemi
        loginForm.addEventListener('click', function() {
            // Formu temizle
            clearErrors();
            
            // Form validasyonu
            let isValid = validateForm();
            
            if (isValid) {
                // Giriş butonunu devre dışı bırak ve yükleniyor durumunu göster
                loginForm.disabled = true;
                loginForm.textContent = 'Giriş Yapılıyor...';
                
                // Firebase ile giriş yap
                firebase.auth().signInWithEmailAndPassword(emailInput.value, passwordInput.value)
                    .then((userCredential) => {
                        // Giriş başarılı, ana sayfaya yönlendir
                        navigateToHome();
                    })
                    .catch((error) => {
                        // Giriş başarısız
                        loginForm.disabled = false;
                        loginForm.textContent = 'Giriş Yap';
                        
                        // Hata mesajlarını Türkçeleştir
                        let errorMessage = error.message;
                        if (error.code === 'auth/user-not-found') {
                            errorMessage = 'Bu e-posta adresine sahip bir kullanıcı bulunamadı.';
                        } else if (error.code === 'auth/wrong-password') {
                            errorMessage = 'Şifre yanlış. Lütfen tekrar deneyin.';
                        } else if (error.code === 'auth/invalid-credential') {
                            errorMessage = 'Geçersiz giriş bilgileri. Lütfen tekrar deneyin.';
                        } else if (error.code === 'auth/invalid-email') {
                            errorMessage = 'Geçersiz e-posta formatı.';
                        } else if (error.code === 'auth/too-many-requests') {
                            errorMessage = 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.';
                        }
                        
                        showLoginError(errorMessage);
                    });
            }
        });
        
        // Form validasyonu
        function validateForm() {
            let isValid = true;
            
            // E-posta validasyonu
            if (!emailInput.value) {
                showError(emailError, 'E-posta alanı boş bırakılamaz');
                isValid = false;
            } else if (!isValidEmail(emailInput.value)) {
                showError(emailError, 'Geçerli bir e-posta adresi giriniz');
                isValid = false;
            }
            
            // Şifre validasyonu
            if (!passwordInput.value) {
                showError(passwordError, 'Şifre alanı boş bırakılamaz');
                isValid = false;
            } else if (passwordInput.value.length < 6) {
                showError(passwordError, 'Şifre en az 6 karakter olmalıdır');
                isValid = false;
            }
            
            return isValid;
        }
        
        // E-posta validasyonu
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
        
        // Hata gösterme
        function showError(element, message) {
            element.textContent = message;
            element.style.display = 'block';
        }
        
        // Giriş hatası gösterme
        function showLoginError(message) {
            loginError.textContent = message;
            loginError.style.display = 'block';
        }
        
        // Hataları temizleme
        function clearErrors() {
            emailError.textContent = '';
            emailError.style.display = 'none';
            passwordError.textContent = '';
            passwordError.style.display = 'none';
            loginError.textContent = '';
            loginError.style.display = 'none';
        }
    }
    
    // Ana sayfaya yönlendirme
    function navigateToHome() {
        // Mevcut URL'yi temizle ve ana sayfaya yönlendir - replaceState kaldırıldı
        window.location.href = '/';
    }
    
    // Kullanıcı bilgilerini güncelle
    function updateUserInfo(user) {
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = user.displayName || user.email || 'Admin Kullanıcı';
        }
    }
}); 