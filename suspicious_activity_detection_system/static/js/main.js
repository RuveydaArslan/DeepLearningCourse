document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const dragZone = document.getElementById('drag-zone');
    const uploadPanel = document.getElementById('upload-panel');
    const fileInput = document.getElementById('file-input');
    const resultPanel = document.getElementById('result-panel');
    const mediaContainer = document.getElementById('media-container');
    const newAnalysisBtn = document.getElementById('new-analysis-btn');
    
    const progressPanel = document.getElementById('progress-panel');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressStatus = document.getElementById('progress-status');
    
    const consoleBody = document.getElementById('console-body');
    const classList = document.getElementById('class-list');
    const noDetectionsMsg = document.getElementById('no-detections-msg');
    const detectionsList = document.getElementById('detections-list');
    
    const muteBtn = document.getElementById('mute-btn');
    const muteIcon = document.getElementById('mute-icon');
    const muteText = document.getElementById('mute-text');
    const alarmSound = document.getElementById('alarm-sound');
    const alarmOverlay = document.getElementById('alarm-overlay');
    const alarmMessage = document.getElementById('alarm-message');
    const dismissAlarmBtn = document.getElementById('dismiss-alarm-btn');
    
    const statThreats = document.getElementById('stat-threats');
    const statProcessed = document.getElementById('stat-processed');

    // App State
    let threatClassesList = [];
    let isMuted = false;
    let audioUnlocked = false;
    let currentJobId = null;
    let sseSource = null;
    let fileCount = 0;
    let threatCount = 0;

    // Initialize Lucide Icons
    lucide.createIcons();

    // Load Model Info
    fetch('/api/model-info')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                threatClassesList = data.threat_classes;
                renderClassList(data.classes);
                logToConsole('Model sınıfları yüklendi. Algılamaya hazır.', 'info');
            } else {
                logToConsole('Model bilgisi yüklenemedi: ' + data.error, 'warning');
            }
        })
        .catch(err => {
            logToConsole('Model yüklenirken bağlantı hatası oluştu.', 'warning');
            console.error(err);
        });

    // Render classes to sidebar
    function renderClassList(classes) {
        classList.innerHTML = '';
        Object.entries(classes).forEach(([idx, name]) => {
            const li = document.createElement('li');
            const isThreat = threatClassesList.includes(name);
            
            li.innerHTML = `
                <span>${idx}: <strong>${name}</strong></span>
                <span class="class-badge ${isThreat ? 'threat' : 'info'}">${isThreat ? 'Tehdit' : 'Bilgi'}</span>
            `;
            classList.appendChild(li);
        });
    }

    // Audio Autoplay Policy Unlocker
    function unlockAudio() {
        if (audioUnlocked) return;
        alarmSound.play().then(() => {
            alarmSound.pause();
            alarmSound.currentTime = 0;
            audioUnlocked = true;
            logToConsole('Ses çalma motoru aktif edildi.', 'system');
        }).catch(err => {
            console.log('Ses motoru aktifleştirme bekliyor...', err);
        });
    }

    document.body.addEventListener('click', unlockAudio, { once: false });

    // Mute/Unmute Control
    muteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent locking/unlocking trigger overlap
        isMuted = !isMuted;
        alarmSound.muted = isMuted;
        
        if (isMuted) {
            muteBtn.classList.add('muted');
            muteText.textContent = 'Sessiz';
            muteIcon.setAttribute('data-lucide', 'volume-x');
            logToConsole('Siren alarmı sessize alındı.', 'system');
        } else {
            muteBtn.classList.remove('muted');
            muteText.textContent = 'Ses Açık';
            muteIcon.setAttribute('data-lucide', 'volume-2');
            logToConsole('Siren alarm sesi açıldı.', 'system');
            // Try playing briefly to ensure working state
            if (audioUnlocked) {
                alarmSound.play().then(() => {
                    alarmSound.pause();
                }).catch(() => {});
            }
        }
        lucide.createIcons();
    });

    // Dismiss Alarm Overlay
    dismissAlarmBtn.addEventListener('click', () => {
        stopAlarm();
    });

    // Console log utility
    function logToConsole(message, type = 'info') {
        const time = new Date().toLocaleTimeString();
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        line.innerHTML = `[${time}] ${message}`;
        consoleBody.appendChild(line);
        consoleBody.scrollTop = consoleBody.scrollHeight;
    }

    // Alarm Trigger Handler
    function triggerAlarm(message) {
        alarmMessage.textContent = message;
        alarmOverlay.classList.remove('hidden');
        
        threatCount++;
        statThreats.textContent = threatCount;
        statThreats.classList.add('alert-active');
        
        if (!isMuted) {
            alarmSound.currentTime = 0;
            alarmSound.play().catch(e => {
                logToConsole('Tarayıcı ses çalma politikasını engelledi. Tıklayarak etkinleştirin.', 'warning');
            });
        }
        logToConsole(`ALERT: ${message}`, 'alert');
    }

    function stopAlarm() {
        alarmOverlay.classList.add('hidden');
        alarmSound.pause();
        alarmSound.currentTime = 0;
        statThreats.classList.remove('alert-active');
        logToConsole('Alarm sıfırlandı, izleme devam ediyor.', 'info');
    }

    // Drag and Drop Events
    ['dragenter', 'dragover'].forEach(eventName => {
        dragZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            uploadPanel.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dragZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            uploadPanel.classList.remove('dragover');
        }, false);
    });

    dragZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    dragZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Reset layout for new analysis
    newAnalysisBtn.addEventListener('click', () => {
        stopAlarm();
        if (sseSource) {
            sseSource.close();
            sseSource = null;
        }
        
        fileInput.value = '';
        mediaContainer.innerHTML = '';
        resultPanel.classList.add('hidden');
        uploadPanel.classList.remove('hidden');
        progressPanel.classList.add('hidden');
        
        noDetectionsMsg.classList.remove('hidden');
        detectionsList.classList.add('hidden');
        detectionsList.innerHTML = '';
        
        progressBarFill.style.width = '0%';
        progressBarFill.textContent = '0%';
        
        logToConsole('Yeni analiz paneli temizlendi.', 'system');
    });

    // File Dispatcher
    function handleFileSelect(file) {
        unlockAudio();
        stopAlarm();
        
        const fileType = file.type;
        logToConsole(`Dosya seçildi: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        
        uploadPanel.classList.add('hidden');
        resultPanel.classList.remove('hidden');
        
        // Show loading state in media container
        mediaContainer.innerHTML = `
            <div style="text-align:center; padding: 20px; color: var(--text-secondary)">
                <i data-lucide="loader" class="panel-icon spinning" style="width: 48px; height: 48px; margin-bottom: 12px;"></i>
                <p>Dosya backend sunucusuna aktarılıyor...</p>
            </div>
        `;
        lucide.createIcons();

        const formData = new FormData();
        formData.append('file', file);

        if (fileType.startsWith('image/')) {
            uploadImage(formData);
        } else if (fileType.startsWith('video/')) {
            uploadVideo(formData);
        } else {
            logToConsole('Hata: Desteklenmeyen dosya türü. Lütfen görsel veya video yükleyin.', 'warning');
            mediaContainer.innerHTML = `
                <div style="text-align:center; padding: 20px; color: var(--danger-color)">
                    <i data-lucide="alert-triangle" style="width: 48px; height: 48px; margin-bottom: 12px;"></i>
                    <p>Desteklenmeyen dosya türü.</p>
                </div>
            `;
            lucide.createIcons();
        }
    }

    // Image Upload & Detection handler
    function uploadImage(formData) {
        logToConsole('Görsel analizi başlatıldı...', 'info');
        
        fetch('/api/detect-image', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                fileCount++;
                statProcessed.textContent = fileCount;
                
                // Show annotated image
                mediaContainer.innerHTML = `
                    <img src="${data.result_url}?t=${new Date().getTime()}" alt="Detection Result">
                `;
                
                logToConsole('Görsel analizi başarıyla tamamlandı.', 'info');
                
                // Display detections list
                displayDetections(data.detections);
                
                // Alarm check
                if (data.alert) {
                    const threats = data.threats.join(', ');
                    triggerAlarm(`Görselde kritik tehdit tespit edildi: ${threats}`);
                } else {
                    logToConsole('Görselde herhangi bir şüpheli tehdit bulunamadı.', 'info');
                }
            } else {
                logToConsole(`Görsel analiz hatası: ${data.error}`, 'warning');
                mediaContainer.innerHTML = `<p style="color:var(--danger-color)">Hata: ${data.error}</p>`;
            }
        })
        .catch(err => {
            logToConsole('Sunucu bağlantı hatası.', 'warning');
            mediaContainer.innerHTML = `<p style="color:var(--danger-color)">Sunucu hatası oluştu.</p>`;
            console.error(err);
        });
    }

    // Video Upload & Detection handler
    function uploadVideo(formData) {
        logToConsole('Video sunucuya yükleniyor...', 'info');
        
        fetch('/api/upload-video', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                currentJobId = data.job_id;
                logToConsole('Video yüklendi. İşlem kuyruğu ID: ' + currentJobId, 'info');
                
                // Show progress panel
                progressPanel.classList.remove('hidden');
                progressStatus.textContent = 'Analiz kuyruğu başlatılıyor...';
                
                // Keep showing loading in media preview
                mediaContainer.innerHTML = `
                    <div style="text-align:center; padding: 20px; color: var(--text-secondary)">
                        <i data-lucide="cpu" class="panel-icon spinning" style="width: 48px; height: 48px; margin-bottom: 12px;"></i>
                        <p>Video çerçeve çerçeve analiz ediliyor. Canlı çıktıyı sağdaki konsoldan takip edebilirsiniz...</p>
                    </div>
                `;
                lucide.createIcons();

                // Open SSE progress connection
                startVideoProgressStream(currentJobId);
            } else {
                logToConsole(`Video yükleme hatası: ${data.error}`, 'warning');
                mediaContainer.innerHTML = `<p style="color:var(--danger-color)">Hata: ${data.error}</p>`;
            }
        })
        .catch(err => {
            logToConsole('Sunucu bağlantı hatası.', 'warning');
            mediaContainer.innerHTML = `<p style="color:var(--danger-color)">Bağlantı hatası oluştu.</p>`;
            console.error(err);
        });
    }

    // Video progress SSE listener
    function startVideoProgressStream(jobId) {
        if (sseSource) {
            sseSource.close();
        }
        
        sseSource = new EventSource(`/api/video-progress/${jobId}`);
        let threatAlerted = false; // Trigger alarm once per video run to avoid loop spam
        
        sseSource.onmessage = (e) => {
            const data = JSON.parse(e.data);
            
            if (data.status === 'not_found') {
                logToConsole('Video analiz görevi bulunamadı.', 'warning');
                sseSource.close();
                return;
            }
            
            // Update progress
            progressBarFill.style.width = `${data.progress}%`;
            progressBarFill.textContent = `${data.progress}%`;
            progressStatus.textContent = `İşleniyor: Frame analiz ediliyor...`;
            
            // Append incoming logs to terminal console
            if (data.logs && data.logs.length > 0) {
                data.logs.forEach(log => {
                    const type = log.alert ? 'alert' : 'info';
                    logToConsole(`[GÖREV] ${log.msg}`, type);
                    
                    // If a critical threat is hit in a log, play sound immediately (if not already triggered)
                    if (log.alert && !threatAlerted) {
                        threatAlerted = true;
                        triggerAlarm('Video akışında şüpheli durumlar tespit ediliyor!');
                    }
                });
            }
            
            // If completed
            if (data.status === 'completed') {
                sseSource.close();
                logToConsole('Video analizi başarıyla tamamlandı. Sonuçlar alınıyor.', 'info');
                
                fileCount++;
                statProcessed.textContent = fileCount;
                progressPanel.classList.add('hidden');
                
                // Render finished annotated video player
                mediaContainer.innerHTML = `
                    <video controls autoplay loop style="width: 100%; height: 100%">
                        <source src="${data.result_url}" type="video/mp4">
                        Tarayıcınız video oynatmayı desteklemiyor.
                    </video>
                `;
                
                // Show detections summary list
                displayDetectionsSummary(data.detections_summary);
                
                // Summary threat check
                const detectedThreats = Object.keys(data.detections_summary).filter(name => threatClassesList.includes(name));
                if (detectedThreats.length > 0) {
                    logToConsole(`Video tehdit özeti: ${detectedThreats.join(', ')} tespit edildi.`, 'alert');
                    if (!threatAlerted) {
                        triggerAlarm(`Videoda kritik tehdit tespit edildi: ${detectedThreats.join(', ')}`);
                    }
                } else {
                    logToConsole('Videoda herhangi bir şüpheli tehdit bulunamadı.', 'info');
                }
            }
            
            // If failed
            if (data.status === 'failed') {
                sseSource.close();
                progressPanel.classList.add('hidden');
                logToConsole(`Video analizi başarısız oldu: ${data.error}`, 'warning');
                mediaContainer.innerHTML = `<p style="color:var(--danger-color)">Video işleme başarısız: ${data.error}</p>`;
            }
        };
        
        sseSource.onerror = (err) => {
            console.error('SSE Error:', err);
            logToConsole('Günlük akış bağlantısında kesinti oldu. Yeniden bağlanılıyor...', 'system');
        };
    }

    // Display image detection items in side card
    function displayDetections(detections) {
        noDetectionsMsg.classList.add('hidden');
        detectionsList.classList.remove('hidden');
        detectionsList.innerHTML = '';
        
        if (detections.length === 0) {
            detectionsList.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--text-muted)">
                    Görselde herhangi bir nesne veya şüpheli aktivite algılanamadı.
                </div>
            `;
            return;
        }

        // Sort detections: threat classes first, then confidence high to low
        detections.sort((a, b) => {
            const aIsThreat = threatClassesList.includes(a.class) ? 1 : 0;
            const bIsThreat = threatClassesList.includes(b.class) ? 1 : 0;
            if (aIsThreat !== bIsThreat) return bIsThreat - aIsThreat;
            return b.confidence - a.confidence;
        });

        detections.forEach(item => {
            const isThreat = threatClassesList.includes(item.class);
            const confPercent = (item.confidence * 100).toFixed(1);
            
            const card = document.createElement('div');
            card.className = `detection-card ${isThreat ? 'threat-detected' : ''}`;
            card.innerHTML = `
                <div class="detection-info">
                    <i data-lucide="${isThreat ? 'alert-triangle' : 'info'}" class="${isThreat ? 'threat-warning-icon' : 'normal-info-icon'}"></i>
                    <div class="detection-details">
                        <h4>${item.class}</h4>
                        <p>${isThreat ? 'Güvenlik Uyarısı' : 'Standart Sınıf Tespiti'}</p>
                    </div>
                </div>
                <span class="confidence-badge">${confPercent}%</span>
            `;
            detectionsList.appendChild(card);
        });
        
        lucide.createIcons();
    }

    // Display video detection items in side card
    function displayDetectionsSummary(summary) {
        noDetectionsMsg.classList.add('hidden');
        detectionsList.classList.remove('hidden');
        detectionsList.innerHTML = '';
        
        const items = Object.entries(summary);
        
        if (items.length === 0) {
            detectionsList.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--text-muted)">
                    Video süresince herhangi bir nesne algılanamadı.
                </div>
            `;
            return;
        }

        // Sort detections: threat classes first
        items.sort((a, b) => {
            const aIsThreat = threatClassesList.includes(a[0]) ? 1 : 0;
            const bIsThreat = threatClassesList.includes(b[0]) ? 1 : 0;
            if (aIsThreat !== bIsThreat) return bIsThreat - aIsThreat;
            return b[1] - a[1];
        });

        items.forEach(([className, maxConf]) => {
            const isThreat = threatClassesList.includes(className);
            const confPercent = (maxConf * 100).toFixed(1);
            
            const card = document.createElement('div');
            card.className = `detection-card ${isThreat ? 'threat-detected' : ''}`;
            card.innerHTML = `
                <div class="detection-info">
                    <i data-lucide="${isThreat ? 'alert-triangle' : 'info'}" class="${isThreat ? 'threat-warning-icon' : 'normal-info-icon'}"></i>
                    <div class="detection-details">
                        <h4>${className}</h4>
                        <p>Maks. Güven Oranı (Video)</p>
                    </div>
                </div>
                <span class="confidence-badge">${confPercent}%</span>
            `;
            detectionsList.appendChild(card);
        });
        
        lucide.createIcons();
    }
});
