document.addEventListener('DOMContentLoaded', function() {
    // Global state
    const formData = {
        file: null,
        title: '',
        description: '',
        category: '',
        tags: [],
        artwork: null,
        explicitContent: false,
        promotionalContent: false,
        publishNow: true,
        publishDate: '',
        publishTime: ''
    };

    // DOM Elements
    const dropArea = document.querySelector('.drop-area');
    const selectBtn = document.querySelector('#step-upload .btn');
    const closeBtn = document.querySelector('.close');
    const steps = document.querySelectorAll('.step');
    const navLinks = document.querySelectorAll('.steps a');
    const titleInput = document.querySelector('#step-details input[type="text"]');
    const descriptionTextarea = document.querySelector('#step-details textarea');
    const categorySelect = document.querySelector('.category-select');
    const tagsInput = document.querySelector('.tags-input');
    const tagsContainer = document.querySelector('.tags-container');
    const imagePreview = document.querySelector('.image-preview');
    const explicitToggle = document.querySelector('#step-details .toggle input[type="checkbox"]');
    const promotionalToggle = document.querySelectorAll('#step-details .toggle input[type="checkbox"]')[1];
    const nextBtn = document.querySelector('#step-details .btn');
    const publishBtn = document.querySelector('#step-preview .btn');
    const publishRadios = document.querySelectorAll('input[name="publish"]');
    const scheduleOptions = document.querySelector('.schedule-options');
    const publishDateInput = document.querySelector('#publish-date');
    const publishTimeInput = document.querySelector('#publish-time');

    // Create hidden file inputs
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.mp3,.m4a,.wav,.mpg,.mp4,.mov';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    const artworkInput = document.createElement('input');
    artworkInput.type = 'file';
    artworkInput.accept = 'image/jpeg,image/jpg,image/png';
    artworkInput.style.display = 'none';
    document.body.appendChild(artworkInput);

    // Initially disable the select button until we set up handlers
    selectBtn.disabled = true;

    // File upload setup
    function setupFileUpload() {
        // Re-enable button after setup
        selectBtn.disabled = false;
        
        // Select file button
        selectBtn.addEventListener('click', handleSelectClick);

        // File input change
        fileInput.addEventListener('change', handleFileSelect);

        // Drag and drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.remove('dragover');
            }, false);
        });

        dropArea.addEventListener('drop', handleDrop, false);
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e) {
        const files = e.dataTransfer.files;
        handleFiles(files);
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            
            // Validate file type
            const validTypes = ['mp3', 'm4a', 'wav', 'mpg', 'mp4', 'mov'];
            const fileType = file.name.split('.').pop().toLowerCase();
            
            if (!validTypes.includes(fileType)) {
                alert('Please select a valid audio or video file');
                return;
            }
            
            // Show upload progress
            showUploadProgress();
            
            // Simulate file processing
            simulateFileProcessing(file);
        }
    }

    function showUploadProgress() {
        const progressContainer = document.querySelector('.upload-progress');
        const progressBar = document.querySelector('.upload-progress-bar');
        
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    progressContainer.style.display = 'none';
                }, 500);
            }
            progressBar.style.width = progress + '%';
        }, 200);
    }

    function simulateFileProcessing(file) {
        setTimeout(() => {
            formData.file = file;
            updateFileDisplay(file);
            
            // Remove the original event listener and replace with next step function
            selectBtn.removeEventListener('click', handleSelectClick);
            selectBtn.textContent = 'Next';
            selectBtn.addEventListener('click', handleNextClick);
        }, 2000); // 2 second processing simulation
    }

    function handleSelectClick(e) {
        e.preventDefault();
        fileInput.click();
    }

    function handleNextClick(e) {
        e.preventDefault();
        goToStep(1);
    }

    function updateFileDisplay(file) {
        // Remove existing file card if any
        const existingCard = document.querySelector('#step-upload .file-card');
        if (existingCard) {
            existingCard.remove();
        }
        
        // Create new file card with audio preview and metadata
        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';
        
        const fileName = file.name;
        const fileType = fileName.split('.').pop().toUpperCase();
        const fileIcon = getFileIcon(fileType);
        const fileSize = formatFileSize(file.size);
        
        // Create audio player if it's an audio file
        let audioPlayerHTML = '';
        if (['MP3', 'M4A', 'WAV'].includes(fileType)) {
            const audioURL = URL.createObjectURL(file);
            audioPlayerHTML = `
                <div class="audio-player">
                    <audio controls>
                        <source src="${audioURL}" type="audio/${fileType.toLowerCase()}">
                        Your browser does not support the audio element.
                    </audio>
                    <div class="audio-metadata">
                        <span>Duration: <span id="audio-duration">Loading...</span></span>
                        <span>Bitrate: <span id="audio-bitrate">Analyzing...</span></span>
                        <span>Size: ${fileSize}</span>
                    </div>
                </div>
            `;
        }
        
        fileCard.innerHTML = `
            ${fileIcon} ${fileName}<br>
            <small>${fileSize}</small>
            ${audioPlayerHTML}
        `;
        
        // Insert after drop area
        dropArea.parentNode.insertBefore(fileCard, dropArea.nextSibling);
        
        // Get audio metadata
        if (['MP3', 'M4A', 'WAV'].includes(fileType)) {
            getAudioMetadata(file);
        }
    }

    function getAudioMetadata(file) {
        const audioURL = URL.createObjectURL(file);
        const audio = new Audio();
        
        audio.addEventListener('loadedmetadata', function() {
            const duration = formatDuration(audio.duration);
            const durationElement = document.getElementById('audio-duration');
            if (durationElement) {
                durationElement.textContent = duration;
            }
            
            // Estimate bitrate (rough calculation)
            const bitrate = Math.round((file.size * 8) / audio.duration / 1000);
            const bitrateElement = document.getElementById('audio-bitrate');
            if (bitrateElement) {
                bitrateElement.textContent = bitrate + ' kbps';
            }
        });
        
        audio.src = audioURL;
    }

    function formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function getFileIcon(fileType) {
        const icons = {
            'MP3': '🎵', 'M4A': '🎵', 'WAV': '🎵',
            'MPG': '🎥', 'MP4': '🎥', 'MOV': '🎥'
        };
        return icons[fileType] || '📄';
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Step navigation
    function goToStep(stepIndex) {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });
        navLinks.forEach((link, index) => {
            link.classList.toggle('active', index === stepIndex);
        });
    }

    // Details form handling
    function setupDetailsForm() {
        // Tags input functionality
        setupTagsInput();
        
        // Image upload functionality
        setupImageUpload();
        
        // Schedule radio buttons
        setupScheduleOptions();
        
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (!validateForm()) {
                alert('Please fill in all required fields');
                return;
            }
            
            // Save form data
            formData.title = titleInput.value.trim();
            formData.description = descriptionTextarea.value.trim();
            formData.category = categorySelect.value;
            formData.explicitContent = explicitToggle ? explicitToggle.checked : false;
            formData.promotionalContent = promotionalToggle ? promotionalToggle.checked : false;
            
            // Update preview
            updatePreview();
            
            // Go to preview step
            goToStep(2);
        });
    }

    function setupTagsInput() {
        tagsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && tagsInput.value.trim()) {
                e.preventDefault();
                addTag(tagsInput.value.trim());
                tagsInput.value = '';
            }
        });
    }

    function addTag(tagText) {
        if (formData.tags.includes(tagText) || formData.tags.length >= 10) return;
        
        formData.tags.push(tagText);
        
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = `
            ${tagText}
            <span class="tag-remove" onclick="removeTag('${tagText}')">&times;</span>
        `;
        
        tagsContainer.insertBefore(tag, tagsInput);
    }

    function removeTag(tagText) {
        formData.tags = formData.tags.filter(tag => tag !== tagText);
        updateTagsDisplay();
    }

    function updateTagsDisplay() {
        const existingTags = tagsContainer.querySelectorAll('.tag');
        existingTags.forEach(tag => tag.remove());
        
        formData.tags.forEach(tagText => {
            const tag = document.createElement('div');
            tag.className = 'tag';
            tag.innerHTML = `
                ${tagText}
                <span class="tag-remove" onclick="removeTag('${tagText}')">&times;</span>
            `;
            tagsContainer.insertBefore(tag, tagsInput);
        });
    }

    function setupImageUpload() {
        imagePreview.addEventListener('click', () => {
            artworkInput.click();
        });
        
        artworkInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate image
                if (file.size > 5 * 1024 * 1024) {
                    alert('Image must be smaller than 5MB');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    formData.artwork = file;
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Episode artwork">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    function setupScheduleOptions() {
        publishRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'schedule') {
                    scheduleOptions.classList.add('active');
                    // Set default to tomorrow
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    publishDateInput.value = tomorrow.toISOString().split('T')[0];
                    publishTimeInput.value = '09:00';
                } else {
                    scheduleOptions.classList.remove('active');
                }
            });
        });
    }

    function validateForm() {
        const title = titleInput.value.trim();
        const description = descriptionTextarea.value.trim();
        const category = categorySelect.value;
        return title && description && category;
    }

    function updatePreview() {
        // Update episode title
        const titleElement = document.getElementById('preview-title');
        titleElement.textContent = formData.title || 'Name of podcast';
        
        // Update episode description
        const descriptionElement = document.getElementById('preview-description');
        descriptionElement.textContent = formData.description || 'No description provided.';
        
        // Update category
        const categoryElement = document.getElementById('preview-category');
        const categoryText = categorySelect.value ? categorySelect.options[categorySelect.selectedIndex].text : 'Uncategorized';
        categoryElement.textContent = categoryText;
        
        // Update tags
        updatePreviewTags();
        
        // Update thumbnail
        updatePreviewThumbnail();
        
        // Update audio player and metadata
        updatePreviewPlayer();
        
        // Update content warnings
        updatePreviewWarnings();
        
        // Update file card in preview sidebar (keep existing functionality)
        updatePreviewFileCard();
    }

    function updatePreviewTags() {
        const tagsContainer = document.getElementById('preview-tags-container');
        tagsContainer.innerHTML = '';
        
        if (formData.tags.length > 0) {
            formData.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.textContent = tag;
                tagsContainer.appendChild(tagElement);
            });
        }
    }

    function updatePreviewThumbnail() {
        const thumbnailElement = document.getElementById('preview-thumbnail-img');
        
        if (formData.artwork) {
            const reader = new FileReader();
            reader.onload = (e) => {
                thumbnailElement.src = e.target.result;
            };
            reader.readAsDataURL(formData.artwork);
        } else {
            thumbnailElement.src = 'https://i.pinimg.com/1200x/cb/e9/96/cbe996b7f522c685915b29d3fdd3691d.jpg';
        }
    }

    function updatePreviewPlayer() {
        const playerContainer = document.getElementById('preview-player');
        
        if (formData.file) {
            const fileName = formData.file.name;
            const fileType = fileName.split('.').pop().toUpperCase();
            
            // Show and populate audio player for audio files
            if (['MP3', 'M4A', 'WAV'].includes(fileType)) {
                playerContainer.style.display = 'block';
                const audioURL = URL.createObjectURL(formData.file);
                
                playerContainer.innerHTML = `
                    <audio controls id="preview-audio">
                        <source src="${audioURL}" type="audio/${fileType.toLowerCase()}">
                        Your browser does not support the audio element.
                    </audio>
                    <div class="player-info">
                        <span>🎵 ${fileName}</span>
                        <span id="preview-audio-duration">Duration: Loading...</span>
                    </div>
                `;
                
                // Get audio duration
                const audioElement = document.getElementById('preview-audio');
                audioElement.addEventListener('loadedmetadata', function() {
                    const duration = formatDuration(audioElement.duration);
                    document.getElementById('preview-audio-duration').textContent = `Duration: ${duration}`;
                });
            } else {
                // For video files, just show basic info
                playerContainer.style.display = 'block';
                playerContainer.innerHTML = `
                    <div class="player-info">
                        <span>🎥 ${fileName}</span>
                        <span>Video file - Preview not available</span>
                    </div>
                `;
            }
        } else {
            playerContainer.style.display = 'none';
        }
    }

    function updatePreviewWarnings() {
        const warningsContainer = document.getElementById('preview-warnings');
        warningsContainer.innerHTML = '';
        
        let hasWarnings = false;
        
        if (formData.explicitContent) {
            const explicitBadge = document.createElement('span');
            explicitBadge.className = 'warning-badge';
            explicitBadge.textContent = 'EXPLICIT ';
            warningsContainer.appendChild(explicitBadge);
            hasWarnings = true;
        }
        
        if (formData.promotionalContent) {
            const promoBadge = document.createElement('span');
            promoBadge.className = 'promo-badge';
            promoBadge.textContent = 'CONTAINS ADS';
            warningsContainer.appendChild(promoBadge);
            hasWarnings = true;
        }
        
        warningsContainer.style.display = hasWarnings ? 'block' : 'none';
    }

    // Update file card in preview
    function updatePreviewFileCard() {
        const existingCard = document.querySelector('#step-preview .file-card');
        if (existingCard) {
            existingCard.remove();
        }

        if (formData.file) {
            const fileCard = document.createElement('div');
            fileCard.className = 'file-card';
            
            const fileName = formData.file.name;
            const fileType = fileName.split('.').pop().toUpperCase();
            const fileIcon = getFileIcon(fileType);
            
            fileCard.innerHTML = `${fileIcon} ${fileName}<br><small>${formData.title}</small>`;
            
            const previewSection = document.querySelector('#step-preview .file-preview');
            previewSection.insertBefore(fileCard, publishBtn);
        }
    }

    // Publish handling
    function setupPublish() {
        publishBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get publish timing
            const selectedRadio = document.querySelector('input[name="publish"]:checked');
            formData.publishNow = selectedRadio.value === 'now';
            
            if (!formData.publishNow) {
                formData.publishDate = publishDateInput.value;
                formData.publishTime = publishTimeInput.value;
            }
            
            console.log('Publishing episode:', formData);
            
            // Save episode to localStorage
            saveEpisodeToStorage(formData);
            
            alert('Episode published successfully!');
            
            // Redirect to dashboard after successful publishing
            setTimeout(() => {
                window.location.href = '/pages/text3.html';
            }, 1000);
        });
    }

    // Save episode data to localStorage
    function saveEpisodeToStorage(episodeData) {
        try {
            // Get existing episodes or initialize empty array
            const existingEpisodes = JSON.parse(localStorage.getItem('publishedEpisodes') || '[]');
            
            // Create new episode object
            const newEpisode = {
                id: Date.now().toString(),
                title: episodeData.title,
                description: episodeData.description,
                category: episodeData.category,
                tags: [...episodeData.tags],
                publishDate: new Date().toISOString(),
                publishNow: episodeData.publishNow,
                scheduledDate: episodeData.publishNow ? null : `${episodeData.publishDate}T${episodeData.publishTime}`,
                // Store file info (note: files can't be stored in localStorage, so we store metadata only)
                fileName: episodeData.file ? episodeData.file.name : '',
                fileType: episodeData.file ? episodeData.file.name.split('.').pop().toUpperCase() : '',
                fileSize: episodeData.file ? episodeData.file.size : 0,
                explicitContent: episodeData.explicitContent,
                promotionalContent: episodeData.promotionalContent
            };
            
            // Add artwork if available (store as data URL)
            if (episodeData.artwork) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    newEpisode.artwork = e.target.result;
                    // Add to array and save
                    existingEpisodes.unshift(newEpisode);
                    localStorage.setItem('publishedEpisodes', JSON.stringify(existingEpisodes));
                };
                reader.readAsDataURL(episodeData.artwork);
            } else {
                // Use default thumbnail
                newEpisode.artwork = 'https://i.pinimg.com/1200x/cb/e9/96/cbe996b7f522c685915b29d3fdd3691d.jpg';
                // Add to array and save
                existingEpisodes.unshift(newEpisode);
                localStorage.setItem('publishedEpisodes', JSON.stringify(existingEpisodes));
            }
            
        } catch (error) {
            console.error('Error saving episode to localStorage:', error);
            alert('Error saving episode data. Please try again.');
        }
    }

    function resetForm() {
        // Reset form data
        Object.assign(formData, {
            file: null,
            title: '',
            description: '',
            category: '',
            tags: [],
            artwork: null,
            explicitContent: false,
            promotionalContent: false,
            publishNow: true,
            publishDate: '',
            publishTime: ''
        });
        
        // Reset form inputs
        if (titleInput) titleInput.value = '';
        if (descriptionTextarea) descriptionTextarea.value = '';
        if (categorySelect) categorySelect.value = '';
        if (explicitToggle) explicitToggle.checked = false;
        if (promotionalToggle) promotionalToggle.checked = false;
        if (publishRadios[0]) publishRadios[0].checked = true;
        if (scheduleOptions) scheduleOptions.classList.remove('active');
        if (publishDateInput) publishDateInput.value = '';
        if (publishTimeInput) publishTimeInput.value = '';
        fileInput.value = '';
        artworkInput.value = '';
        
        // Reset tags display
        updateTagsDisplay();
        
        // Reset image preview
        imagePreview.innerHTML = `
            <div class="image-preview-placeholder">
                <div>📷</div>
                <div>Add image</div>
            </div>
        `;
        
        // Reset button
        selectBtn.textContent = 'Select a file';
        selectBtn.removeEventListener('click', handleNextClick);
        selectBtn.addEventListener('click', handleSelectClick);
        
        // Remove file cards
        document.querySelectorAll('.file-card').forEach(card => card.remove());
        
        // Hide progress bar
        const progressContainer = document.querySelector('.upload-progress');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
    }

    // Make removeTag function global so it can be called from onclick
    window.removeTag = removeTag;

    // Close button
    function setupCloseButton() {
        closeBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to close? Any unsaved changes will be lost.')) {
                resetForm();
                goToStep(0);
            }
        });
    }

    // Initialize everything
    function init() {
        setupFileUpload();
        setupDetailsForm();
        setupPublish();
        setupCloseButton();
    }

    init();
});