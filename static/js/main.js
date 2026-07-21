document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - General
    const mobileMenu = document.querySelector('#mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    const fontsizeToolbar = document.querySelector('#fontsize-toolbar');
    const fontSizeInput = document.querySelector('#font-size-input');
    const fontSizeVal = document.querySelector('#font-size-val');
    
    // DOM Elements - Admin Login
    const adminLoginArea = document.querySelector('#admin-login-area');
    const adminLoggedInArea = document.querySelector('#admin-logged-in-area');
    const adminIdInput = document.querySelector('#admin-id-input');
    const adminLoginBtn = document.querySelector('#admin-login-btn');
    const adminLogoutBtn = document.querySelector('#admin-logout-btn');
    const loginErrorMsg = document.querySelector('#login-error-msg');
    
    // DOM Elements - Admin Operations
    const editModeToggle = document.querySelector('#edit-mode-toggle');
    const saveBtn = document.querySelector('#save-btn');
    const saveStatus = document.querySelector('#save-status');
    
    let activeEditableElement = null;
    let hasChanges = false;
    let currentSlideIndex = 0;
    let isAddingSlide = false;

    // Default Site Data (Fallback for file:/// double-click access)
    const defaultSiteData = {
        "site_title": "足から始める健康旅行！！ - ラッキーベル リボーンサンダル宿泊プラン",
        "navigation": {
            "brand": "健康サンダル旅行"
        },
        "hero": {
            "title": "足から始める健康旅行！！",
            "subtitle": "旅行に疲れた足に、極上の癒やしを。三世代でおそろいの健康サンダルを履いて、最高の思い出を作りませんか？",
            "image": "./static/images/hero_bg.png",
            "title_size": "56px",
            "subtitle_size": "24px"
        },
        "background": {
            "title": "なぜこの企画を考えたか？",
            "text_1": "楽しい旅行も、歩き続けると夕方には足がパンパンに疲れてしまいます。せっかくの家族旅行、全員が全力で楽しむためには「足の健康」が欠かせません。",
            "text_2": "そこで私たちは、教育シューズで有名なラッキーベルの「リボーンサンダル」に着目しました。このサンダルが生み出すリフレッシュ効果を、ぜひ実際の旅行中に体験してほしいという強い思いから、この特別な宿泊プランが誕生しました。",
            "title_size": "36px",
            "text_size": "18px"
        },
        "sandal": {
            "title": "ラッキーベル リボーンサンダルの魅力",
            "desc_1": "足元から全身を整える、新感覚の健康サンダルです。独自のインソール設計が、歩くたびに足裏を心地よく刺激します。",
            "desc_2": "【三世代でおそろい】子供用からシニア用まで豊富なサイズとカラーを用意。家族みんなでお揃いのサンダルを履き、旅行中の疲労を軽減させながら、足元から繋がる温かい家族の時間を提供します。",
            "images": [
                "./static/images/sandal_overview.png",
                "./static/images/sandal_family.png",
                "./static/images/sandal_detail.png"
            ],
            "benefits": [
                {"title": "疲労回復効果", "detail": "歩き疲れた足裏の筋肉を優しくほぐし、翌日の旅も軽やかに。"},
                {"title": "正しい歩行姿勢", "detail": "アーチサポート機能により、自然と背筋が伸びる美しい姿勢をサポート。"},
                {"title": "三世代デザイン", "detail": "年齢を問わず愛される、シンプルで遊び心のあるプレミアムなデザイン。"}
            ],
            "title_size": "36px",
            "text_size": "18px"
        },
        "plans": {
            "title": "宿泊プラン一覧",
            "subtitle": "あなたの家族に最適な、サンダル体験付き特別宿泊プラン",
            "title_size": "36px",
            "text_size": "18px",
            "list": [
                {
                    "id": 1,
                    "title": "【三世代ファミリー限定】足元から整う温泉旅行プラン",
                    "description": "おじいちゃん、おばあちゃんからお子様まで、全員分のリボーンサンダルがお土産として付いてくる一番人気のプランです。お揃いのサンダルで宿の周りをお散歩しましょう！",
                    "price": "大人 18,500円〜 / 名（消費税込）",
                    "image": "./static/images/plan_ryokan.png"
                },
                {
                    "id": 2,
                    "title": "【健康意識向上】極上のフットケア＆疲労回復ステイプラン",
                    "description": "旅の疲れを徹底的に癒やしたい方向け。リボーンサンダルの体験に加え、温泉での足湯スパ、特製ハーブティーがセットになったリラクゼーション重視のプランです。",
                    "price": "大人 21,000円〜 / 名（消費税込）",
                    "image": "./static/images/plan_ryokan.png"
                }
            ]
        }
    };

    // Initialize Site Data
    const isServerEnv = window.location.protocol.startsWith('http');
    
    if (isServerEnv && window.siteData) {
        console.log("Loaded data from Flask server.");
    } else {
        const savedData = localStorage.getItem('health_sandal_site_data');
        if (savedData) {
            try {
                window.siteData = JSON.parse(savedData);
                console.log("Loaded data from LocalStorage.");
            } catch (e) {
                console.error("Failed to parse local storage data", e);
                window.siteData = JSON.parse(JSON.stringify(defaultSiteData));
            }
        } else {
            window.siteData = JSON.parse(JSON.stringify(defaultSiteData));
            console.log("Using default site data.");
        }
    }

    // Apply data values to DOM & Slider Init
    applyDataToDOM();
    renderSandalSlider();

    // ==========================================================================
    // Admin Session Login / Logout Control
    // ==========================================================================
    checkLoginState();

    function checkLoginState() {
        const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
        
        if (isLoggedIn) {
            // ログイン済み状態
            if (adminLoginArea) adminLoginArea.classList.add('hidden');
            if (adminLoggedInArea) adminLoggedInArea.classList.remove('hidden');
            
            // 以前のトグルONのままリロードした場合はONを適用
            if (editModeToggle && editModeToggle.checked) {
                document.body.classList.add('edit-mode-active');
                enableEditing();
            }
        } else {
            // 未ログイン状態
            if (adminLoginArea) adminLoginArea.classList.remove('hidden');
            if (adminLoggedInArea) adminLoggedInArea.classList.add('hidden');
            
            // 編集モードを強制解除
            if (editModeToggle) editModeToggle.checked = false;
            document.body.classList.remove('edit-mode-active');
            disableEditing();
            if (fontsizeToolbar) fontsizeToolbar.classList.add('hidden');
        }
    }

    // Login Action
    function performLogin() {
        if (!adminIdInput) return;
        
        const loginId = adminIdInput.value.trim();
        if (loginId === '1024') {
            sessionStorage.setItem('admin_logged_in', 'true');
            if (loginErrorMsg) loginErrorMsg.innerText = '';
            adminIdInput.value = '';
            checkLoginState();
            showSaveStatus('ログインに成功しました。編集スイッチをONにして開始してください。', 'success');
        } else {
            if (loginErrorMsg) loginErrorMsg.innerText = 'ログインIDが正しくありません。';
            adminIdInput.focus();
        }
    }

    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', performLogin);
    }

    if (adminIdInput) {
        adminIdInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performLogin();
            }
        });
    }

    // Logout Action
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            if (hasChanges && !confirm("未保存の編集内容がありますが、保存せずにログアウトしますか？")) {
                return;
            }
            sessionStorage.removeItem('admin_logged_in');
            hasChanges = false;
            if (saveBtn) saveBtn.disabled = true;
            checkLoginState();
            showSaveStatus('ログアウトしました。', 'info');
        });
    }

    // ==========================================================================
    // DOM Appliers
    // ==========================================================================
    function applyDataToDOM() {
        const data = window.siteData;
        if (!data) return;

        // Nav brand
        const navBrand = document.getElementById('nav-brand');
        if (navBrand && data.navigation?.brand) navBrand.innerText = data.navigation.brand;

        // Hero
        const hero = document.getElementById('hero');
        const heroTitle = document.getElementById('hero-title');
        const heroSubtitle = document.getElementById('hero-subtitle');
        if (hero && data.hero?.image) hero.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('${data.hero.image}')`;
        if (heroTitle && data.hero?.title) {
            heroTitle.innerText = data.hero.title;
            heroTitle.style.fontSize = data.hero.title_size || '56px';
        }
        if (heroSubtitle && data.hero?.subtitle) {
            heroSubtitle.innerText = data.hero.subtitle;
            heroSubtitle.style.fontSize = data.hero.subtitle_size || '24px';
        }

        // Background
        const bgTitle = document.getElementById('background-title');
        const bgText1 = document.getElementById('background-text1');
        const bgText2 = document.getElementById('background-text2');
        if (bgTitle && data.background?.title) {
            bgTitle.innerText = data.background.title;
            bgTitle.style.fontSize = data.background.title_size || '36px';
        }
        if (bgText1 && data.background?.text_1) {
            bgText1.innerText = data.background.text_1;
            bgText1.style.fontSize = data.background.text_size || '18px';
        }
        if (bgText2 && data.background?.text_2) {
            bgText2.innerText = data.background.text_2;
            bgText2.style.fontSize = data.background.text_size || '18px';
        }

        // Sandal
        const sandalTitle = document.getElementById('sandal-title');
        const sandalDesc1 = document.getElementById('sandal-desc1');
        const sandalDesc2 = document.getElementById('sandal-desc2');
        if (sandalTitle && data.sandal?.title) {
            sandalTitle.innerText = data.sandal.title;
            sandalTitle.style.fontSize = data.sandal.title_size || '36px';
        }
        if (sandalDesc1 && data.sandal?.desc_1) {
            sandalDesc1.innerText = data.sandal.desc_1;
            sandalDesc1.style.fontSize = data.sandal.text_size || '18px';
        }
        if (sandalDesc2 && data.sandal?.desc_2) {
            sandalDesc2.innerText = data.sandal.desc_2;
            sandalDesc2.style.fontSize = data.sandal.text_size || '18px';
        }

        // Plans
        const plansTitle = document.getElementById('plans-title');
        const plansSubtitle = document.getElementById('plans-subtitle');
        if (plansTitle && data.plans?.title) {
            plansTitle.innerText = data.plans.title;
            plansTitle.style.fontSize = data.plans.title_size || '36px';
        }
        if (plansSubtitle && data.plans?.subtitle) {
            plansSubtitle.innerText = data.plans.subtitle;
            plansSubtitle.style.fontSize = data.plans.text_size || '18px';
        }

        if (data.plans?.list) {
            data.plans.list.forEach(plan => {
                const planCard = document.querySelector(`.plan-card[data-plan-id="${plan.id}"]`);
                if (planCard) {
                    const img = planCard.querySelector('.plan-img');
                    const title = planCard.querySelector('.plan-card-title');
                    const desc = planCard.querySelector('.plan-card-desc');
                    const price = planCard.querySelector('.plan-price');

                    if (img && plan.image) img.src = plan.image;
                    if (title && plan.title) title.innerText = plan.title;
                    if (desc && plan.description) desc.innerText = plan.description;
                    if (price && plan.price) price.innerText = plan.price;
                }
            });
        }
    }

    // Sandal Slider
    function renderSandalSlider() {
        const images = window.siteData.sandal.images || [];
        const wrapper = document.querySelector('.slider-wrapper');
        const dotsContainer = document.querySelector('.slider-dots');
        
        if (!wrapper || !dotsContainer) return;
        wrapper.innerHTML = '';
        dotsContainer.innerHTML = '';
        
        if (images.length === 0) {
            wrapper.innerHTML = '<div class="slide active"><div class="flex-center" style="height:100%; background:#eee; color:#666;">写真が登録されていません</div></div>';
            return;
        }
        
        if (currentSlideIndex >= images.length) currentSlideIndex = images.length - 1;
        if (currentSlideIndex < 0) currentSlideIndex = 0;
        
        images.forEach((imgUrl, idx) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = `slide ${idx === currentSlideIndex ? 'active' : ''}`;
            const imgEl = document.createElement('img');
            imgEl.className = 'product-img img-responsive';
            imgEl.src = imgUrl;
            imgEl.alt = `ラッキーベル リボーンサンダル ${idx + 1}`;
            slideDiv.appendChild(imgEl);
            wrapper.appendChild(slideDiv);
            
            const dotSpan = document.createElement('span');
            dotSpan.className = `dot ${idx === currentSlideIndex ? 'active' : ''}`;
            dotSpan.addEventListener('click', () => showSlide(idx));
            dotsContainer.appendChild(dotSpan);
        });
    }

    function showSlide(index) {
        const images = window.siteData.sandal.images || [];
        if (images.length === 0) return;
        
        if (index >= images.length) index = 0;
        if (index < 0) index = images.length - 1;
        
        currentSlideIndex = index;
        
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        
        slides.forEach((slide, idx) => {
            slide.classList.toggle('active', idx === currentSlideIndex);
        });
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentSlideIndex);
        });
    }

    const prevArrow = document.querySelector('.prev-arrow');
    const nextArrow = document.querySelector('.next-arrow');
    if (prevArrow) prevArrow.addEventListener('click', () => showSlide(currentSlideIndex - 1));
    if (nextArrow) nextArrow.addEventListener('click', () => showSlide(currentSlideIndex + 1));

    // ==========================================================================
    // 1. General User Interactions
    // ==========================================================================
    
    // Mobile Menu Toggle
    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('is-active');
            navMenu.classList.toggle('active');
        });
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu) mobileMenu.classList.remove('is-active');
            if (navMenu) navMenu.classList.remove('active');
        });
    });

    // Foot Check Diagnosis Logic
    const calcBtn = document.getElementById('calc-checks-btn');
    const checkResult = document.getElementById('check-result');
    const resultTitle = document.getElementById('result-title');
    const resultText = document.getElementById('result-text');

    if (calcBtn) {
        calcBtn.addEventListener('click', () => {
            const checkedCount = document.querySelectorAll('.foot-check:checked').length;
            checkResult.classList.remove('hidden');
            
            let title = "";
            let message = "";
            
            if (checkedCount === 0) {
                title = "👣 すっきり健康足！";
                message = "あなたの足はとても健康的で元気です！旅行先でのアクティビティも全力で楽しめる状態です。この調子をキープしつつ、リボーンサンダルでさらに極上の快適さを体験してください。";
            } else if (checkedCount <= 2) {
                title = "👣 お疲れ警報発令中";
                message = "足元に少しずつ疲労が蓄積しています。旅行の夕方には足の張りやむくみが気になり始めるサイン。ラッキーベルのリボーンサンダルを履いて、早めのセルフケアを行いましょう！";
            } else {
                title = "🚨 足裏SOS！限界状態";
                message = "かなり足が疲れており、悲鳴をあげている状態です！せっかくの旅行も楽しさが半減してしまうかもしれません。リボーンサンダルをお揃いで履いて、温泉の足湯やフットケアで徹底的に癒やす宿泊プランが非常におすすめです。";
            }
            
            resultTitle.innerText = title;
            resultText.innerText = message;
            checkResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    // ==========================================================================
    // 2. Booking Modal Logic
    // ==========================================================================
    window.bookingPopup = function(planName) {
        const modal = document.getElementById('booking-modal');
        const planNameEl = document.getElementById('modal-plan-name');
        if (modal && planNameEl) {
            planNameEl.innerText = planName;
            modal.classList.add('show');
        }
    };

    window.closeBookingModal = function() {
        const modal = document.getElementById('booking-modal');
        if (modal) modal.classList.remove('show');
    };

    const closeModalSpan = document.querySelector('.close-modal');
    if (closeModalSpan) closeModalSpan.addEventListener('click', closeBookingModal);

    window.addEventListener('click', (e) => {
        const modal = document.getElementById('booking-modal');
        if (e.target === modal) closeBookingModal();
    });

    // ==========================================================================
    // 3. Admin Edit Mode Logic
    // ==========================================================================
    
    // Toggle Edit Mode
    if (editModeToggle) {
        editModeToggle.addEventListener('change', (e) => {
            const isEditMode = e.target.checked;
            if (isEditMode) {
                document.body.classList.add('edit-mode-active');
                enableEditing();
            } else {
                document.body.classList.remove('edit-mode-active');
                disableEditing();
                fontsizeToolbar.classList.add('hidden');
            }
        });
    }

    function enableEditing() {
        document.querySelectorAll('.editable, .editable-list').forEach(el => {
            el.setAttribute('contenteditable', 'true');
            el.addEventListener('focus', onEditableFocus);
            el.addEventListener('blur', onEditableBlur);
        });
        setupImageUploads();
    }

    function disableEditing() {
        document.querySelectorAll('.editable, .editable-list').forEach(el => {
            el.removeAttribute('contenteditable');
            el.removeEventListener('focus', onEditableFocus);
            el.removeEventListener('blur', onEditableBlur);
        });
    }

    function onEditableFocus(e) {
        activeEditableElement = e.target;
        const section = activeEditableElement.getAttribute('data-section');
        const listId = activeEditableElement.getAttribute('data-list-id');
        
        if (section && !listId) {
            const currentSize = window.getComputedStyle(activeEditableElement).fontSize;
            const sizeVal = parseInt(currentSize);
            
            fontSizeInput.value = sizeVal;
            fontSizeVal.innerText = `${sizeVal}px`;
            fontsizeToolbar.classList.remove('hidden');
        } else {
            fontsizeToolbar.classList.add('hidden');
        }
    }

    function onEditableBlur(e) {
        const el = e.target;
        const section = el.getAttribute('data-section');
        const key = el.getAttribute('data-key');
        const listId = el.getAttribute('data-list-id');
        const newValue = el.innerText.trim();
        
        if (section) {
            if (listId) {
                const id = parseInt(listId);
                const list = window.siteData[section].list;
                const item = list.find(x => x.id === id);
                if (item && item[key] !== newValue) {
                    item[key] = newValue;
                    markAsChanged();
                }
            } else {
                if (window.siteData[section] && window.siteData[section][key] !== newValue) {
                    window.siteData[section][key] = newValue;
                    markAsChanged();
                } else if (section === 'navigation' && window.siteData.navigation[key] !== newValue) {
                    window.siteData.navigation[key] = newValue;
                    markAsChanged();
                }
            }
        }
    }

    if (fontSizeInput) {
        fontSizeInput.addEventListener('input', (e) => {
            if (activeEditableElement) {
                const newSize = `${e.target.value}px`;
                activeEditableElement.style.fontSize = newSize;
                fontSizeVal.innerText = newSize;
                
                const section = activeEditableElement.getAttribute('data-section');
                const key = activeEditableElement.getAttribute('data-key');
                
                if (section && window.siteData[section]) {
                    const sizeKey = key.includes('title') ? 'title_size' : 'text_size';
                    if (window.siteData[section][sizeKey] !== newSize) {
                        window.siteData[section][sizeKey] = newSize;
                        markAsChanged();
                    }
                }
            }
        });
    }

    // Image Upload setup
    function setupImageUploads() {
        document.querySelectorAll('.image-edit-overlay').forEach(overlay => {
            const fileInput = overlay.querySelector('.image-upload-input');
            const changeBtn = overlay.querySelector('.image-edit-btn');
            const addBtn = overlay.querySelector('.add-slide-btn');
            const deleteBtn = overlay.querySelector('.delete-slide-btn');
            
            if (changeBtn) {
                const newChangeBtn = changeBtn.cloneNode(true);
                changeBtn.parentNode.replaceChild(newChangeBtn, changeBtn);
                newChangeBtn.addEventListener('click', () => {
                    isAddingSlide = false;
                    fileInput.click();
                });
            }

            if (addBtn) {
                const newAddBtn = addBtn.cloneNode(true);
                addBtn.parentNode.replaceChild(newAddBtn, addBtn);
                newAddBtn.addEventListener('click', () => {
                    isAddingSlide = true;
                    fileInput.click();
                });
            }

            if (deleteBtn) {
                const newDeleteBtn = deleteBtn.cloneNode(true);
                deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
                newDeleteBtn.addEventListener('click', () => {
                    const targetSection = overlay.getAttribute('data-target-section');
                    if (targetSection === 'sandal') {
                        const images = window.siteData.sandal.images || [];
                        if (images.length <= 1) {
                            alert("写真は最低1枚登録されている必要があります。");
                            return;
                        }
                        if (confirm("現在表示している写真を削除しますか？")) {
                            images.splice(currentSlideIndex, 1);
                            if (currentSlideIndex >= images.length) {
                                currentSlideIndex = images.length - 1;
                            }
                            renderSandalSlider();
                            markAsChanged();
                            showSaveStatus('写真を削除しました（未保存）', 'info');
                        }
                    }
                });
            }

            const newFileInput = fileInput.cloneNode(true);
            fileInput.parentNode.replaceChild(newFileInput, fileInput);

            newFileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const targetSection = overlay.getAttribute('data-target-section');
                const targetKey = overlay.getAttribute('data-target-key');
                const listId = overlay.getAttribute('data-target-list-id');

                if (isServerEnv) {
                    const formData = new FormData();
                    formData.append('file', file);

                    try {
                        showSaveStatus('画像アップロード中...', 'info');
                        const response = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            handleImageProcessSuccess(result.image_url, targetSection, targetKey, listId);
                            showSaveStatus(isAddingSlide ? '新しい写真を追加しました！' : '画像を貼り替えました！', 'success');
                        } else {
                            showSaveStatus(`画像アップロード失敗: ${result.message}`, 'error');
                        }
                    } catch (err) {
                        showSaveStatus(`通信エラー: ${err.message}`, 'error');
                    }
                } else {
                    try {
                        showSaveStatus('画像を読み込み中...', 'info');
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            const base64Url = event.target.result;
                            handleImageProcessSuccess(base64Url, targetSection, targetKey, listId);
                            showSaveStatus(isAddingSlide ? '写真を追加しました（未保存）' : '写真を貼り替えました（未保存）', 'info');
                        };
                        reader.readAsDataURL(file);
                    } catch (err) {
                        showSaveStatus(`読み込み失敗: ${err.message}`, 'error');
                    }
                }
            });
        });
    }

    function handleImageProcessSuccess(imageUrl, targetSection, targetKey, listId) {
        if (targetSection === 'sandal' && targetKey === 'images') {
            const images = window.siteData.sandal.images || [];
            if (isAddingSlide) {
                images.push(imageUrl);
                currentSlideIndex = images.length - 1;
            } else {
                images[currentSlideIndex] = imageUrl;
            }
            renderSandalSlider();
            markAsChanged();
        } else {
            if (targetSection === 'hero') {
                const heroEl = document.getElementById('hero');
                heroEl.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('${imageUrl}')`;
            } else if (targetSection === 'plans' && listId) {
                const planCard = document.querySelector(`.plan-card[data-plan-id="${listId}"]`);
                const imgEl = planCard.querySelector('.plan-img');
                imgEl.src = imageUrl;
            }
            
            if (targetSection) {
                if (listId) {
                    const id = parseInt(listId);
                    const list = window.siteData[targetSection].list;
                    const item = list.find(x => x.id === id);
                    if (item) {
                        item[targetKey] = imageUrl;
                        markAsChanged();
                    }
                } else {
                    if (window.siteData[targetSection]) {
                        window.siteData[targetSection][targetKey] = imageUrl;
                        markAsChanged();
                    }
                }
            }
        }
    }

    function markAsChanged() {
        hasChanges = true;
        saveBtn.disabled = false;
        showSaveStatus('未保存の変更があります', 'info');
    }

    function showSaveStatus(message, type) {
        saveStatus.className = 'save-status';
        if (type) {
            saveStatus.classList.add(type);
        }
        saveStatus.innerText = message;
    }

    // Save Action
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            showSaveStatus('保存中...', 'info');
            saveBtn.disabled = true;

            if (isServerEnv) {
                try {
                    const response = await fetch('/api/save', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(window.siteData)
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        showSaveStatus('すべての変更を保存しました！', 'success');
                        hasChanges = false;
                    } else {
                        showSaveStatus(`保存失敗: ${result.message}`, 'error');
                        saveBtn.disabled = false;
                    }
                } catch (err) {
                    showSaveStatus(`通信エラー: ${err.message}`, 'error');
                    saveBtn.disabled = false;
                }
            } else {
                try {
                    localStorage.setItem('health_sandal_site_data', JSON.stringify(window.siteData));
                    showSaveStatus('ローカルにデータを保存しました！', 'success');
                    hasChanges = false;
                } catch (err) {
                    showSaveStatus(`ブラウザ保存失敗: ${err.message}`, 'error');
                    saveBtn.disabled = false;
                }
            }
        });
    }

    // Exit protection
    window.addEventListener('beforeunload', (e) => {
        if (hasChanges) {
            e.preventDefault();
            e.returnValue = '変更が保存されていません。移動しますか？';
        }
    });
});
