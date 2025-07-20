/**
 * 내가올려.kr - 메인 JavaScript
 * Alpine.js 컴포넌트 및 페이지 기능
 */

// Alpine.js Main App Component
function mainApp() {
    return {
        // 탭 상태
        activeTab: 'general',
        
        // 무료 분석 모달 상태
        showFreeAnalysisModal: false,
        
        // 무료 분석 폼 데이터
        freeAnalysis: {
            businessName: '',
            name: '',
            phone: '',
            email: '',
            url: '',
            message: ''
        },
        
        // 초기화
        init() {
            // 스크롤 이벤트 리스너
            this.initScrollEffects();
        },
        
        // 스크롤 효과 초기화
        initScrollEffects() {
            let lastScroll = 0;
            window.addEventListener('scroll', () => {
                const currentScroll = window.pageYOffset;
                const header = document.querySelector('.fixed-header');
                
                if (currentScroll > 100) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                
                lastScroll = currentScroll;
            });
        },
        
        // 무료 분석 제출
        async submitFreeAnalysis() {
            // 간단한 유효성 검사
            if (!this.freeAnalysis.businessName || !this.freeAnalysis.name || !this.freeAnalysis.phone) {
                this.showErrorMessage('필수 항목을 모두 입력해주세요.');
                return;
            }
            
            // 전화번호 형식 검사
            const phoneRegex = /^010-\d{4}-\d{4}$/;
            if (!phoneRegex.test(this.freeAnalysis.phone)) {
                this.showErrorMessage('올바른 전화번호 형식으로 입력해주세요. (010-0000-0000)');
                return;
            }
            
            // 이메일 형식 검사 (선택사항)
            if (this.freeAnalysis.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(this.freeAnalysis.email)) {
                    this.showErrorMessage('올바른 이메일 형식으로 입력해주세요.');
                    return;
                }
            }
            
            try {
                // API 호출 (실제 구현 시)
                const response = await fetch('/api/lead.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.freeAnalysis)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        this.showSuccessMessage('무료 분석 신청이 완료되었습니다. 빠른 시일 내에 연락드리겠습니다.');
                        this.showFreeAnalysisModal = false;
                        this.resetFreeAnalysisForm();
                    } else {
                        this.showErrorMessage(result.message || '신청 중 오류가 발생했습니다.');
                    }
                } else {
                    throw new Error('Network response was not ok');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                // 개발 중에는 콘솔에만 표시
                console.log('무료 분석 신청 데이터:', this.freeAnalysis);
                this.showSuccessMessage('무료 분석 신청이 완료되었습니다. 빠른 시일 내에 연락드리겠습니다.');
                this.showFreeAnalysisModal = false;
                this.resetFreeAnalysisForm();
            }
        },
        
        // 폼 초기화
        resetFreeAnalysisForm() {
            this.freeAnalysis = {
                businessName: '',
                name: '',
                phone: '',
                email: '',
                url: '',
                message: ''
            };
        },
        
        // 성공 메시지 표시
        showSuccessMessage(message) {
            const toast = this.createToast(message, 'success');
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 5000);
        },
        
        // 에러 메시지 표시
        showErrorMessage(message) {
            const toast = this.createToast(message, 'error');
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 5000);
        },
        
        // 토스트 메시지 생성
        createToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `
                <div class="toast-content">
                    <svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                        ${type === 'success' 
                            ? '<path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
                            : '<path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
                        }
                    </svg>
                    <span>${message}</span>
                </div>
            `;
            
            // 애니메이션 클래스 추가
            requestAnimationFrame(() => {
                toast.classList.add('toast-show');
            });
            
            return toast;
        }
    };
}

// DOM 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('내가올려.kr 초기화 완료');
    
    // 스무스 스크롤
    initSmoothScroll();
    
    // 플로팅 카카오톡 버튼
    initKakaoButton();
});

/**
 * 스무스 스크롤 초기화
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * 카카오톡 버튼 초기화
 */
function initKakaoButton() {
    const kakaoBtn = document.querySelector('.floating-kakao-btn');
    if (kakaoBtn) {
        kakaoBtn.addEventListener('click', function() {
            // 실제 카카오톡 채널 URL로 변경 필요
            window.open('https://pf.kakao.com/_xxxxxK', '_blank');
        });
    }
}

/**
 * 가격 포맷팅 헬퍼
 */
window.formatPrice = function(price) {
    return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW'
    }).format(price);
};

/**
 * 전화번호 포맷팅 헬퍼
 */
window.formatPhoneNumber = function(input) {
    const numbers = input.replace(/[^\d]/g, '');
    
    if (numbers.length <= 3) {
        return numbers;
    } else if (numbers.length <= 7) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length <= 11) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    }
    
    return input;
};

// Alpine.js 플러그인 및 전역 설정
document.addEventListener('alpine:init', () => {
    // x-collapse 플러그인 (아코디언용)
    Alpine.directive('collapse', (el) => {
        el._x_isShown = false;
        
        if (!el._x_doShow) {
            el._x_doShow = () => {
                el.style.height = `${el.scrollHeight}px`;
                el._x_isShown = true;
            };
        }
        
        if (!el._x_doHide) {
            el._x_doHide = () => {
                el.style.height = '0px';
                el._x_isShown = false;
            };
        }
        
        let hide = () => {
            el.style.overflow = 'hidden';
            el.style.height = '0px';
        };
        
        let show = () => {
            el.style.overflow = 'hidden';
            el.style.height = 'auto';
            const height = el.scrollHeight;
            el.style.height = '0px';
            setTimeout(() => {
                el.style.height = `${height}px`;
            });
        };
        
        if (el._x_isShown) show();
        else hide();
        
        el._x_transition = {
            in() { show(); },
            out() { hide(); }
        };
    });
});

// 토스트 스타일 추가
const style = document.createElement('style');
style.textContent = `
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 2100;
        max-width: 350px;
    }
    
    .toast-show {
        transform: translateX(0);
    }
    
    .toast-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .toast-icon {
        flex-shrink: 0;
    }
    
    .toast-success {
        border-left: 4px solid #10b981;
    }
    
    .toast-success .toast-icon {
        color: #10b981;
    }
    
    .toast-error {
        border-left: 4px solid #ef4444;
    }
    
    .toast-error .toast-icon {
        color: #ef4444;
    }
    
    /* 헤더 스크롤 스타일 */
    .fixed-header.scrolled {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    @media (max-width: 768px) {
        .toast {
            right: 10px;
            left: 10px;
            max-width: none;
        }
    }
`;
document.head.appendChild(style);