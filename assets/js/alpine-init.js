/**
 * Alpine.js 초기화 및 전역 스토어 설정
 * 내가올려.kr
 */

document.addEventListener('alpine:init', () => {
    // 전역 스토어 - 장바구니/주문 관리
    Alpine.store('cart', {
        items: [],
        
        // 아이템 추가
        addItem(item) {
            const existingItem = this.items.find(i => i.id === item.id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.items.push({
                    ...item,
                    quantity: 1
                });
            }
            this.saveToLocalStorage();
        },
        
        // 아이템 제거
        removeItem(id) {
            this.items = this.items.filter(item => item.id !== id);
            this.saveToLocalStorage();
        },
        
        // 수량 업데이트
        updateQuantity(id, quantity) {
            const item = this.items.find(i => i.id === id);
            if (item) {
                item.quantity = Math.max(1, quantity);
                this.saveToLocalStorage();
            }
        },
        
        // 전체 금액 계산
        get total() {
            return this.items.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);
        },
        
        // 포맷된 가격
        get formattedTotal() {
            return new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: 'KRW'
            }).format(this.total);
        },
        
        // 로컬 스토리지 저장
        saveToLocalStorage() {
            localStorage.setItem('cart', JSON.stringify(this.items));
        },
        
        // 로컬 스토리지에서 불러오기
        loadFromLocalStorage() {
            const saved = localStorage.getItem('cart');
            if (saved) {
                this.items = JSON.parse(saved);
            }
        },
        
        // 초기화
        init() {
            this.loadFromLocalStorage();
        }
    });
    
    // 전역 스토어 - 사용자 정보
    Alpine.store('user', {
        data: {
            businessType: '',
            region: '',
            businessName: '',
            phone: ''
        },
        
        updateData(newData) {
            this.data = { ...this.data, ...newData };
            this.saveToLocalStorage();
        },
        
        saveToLocalStorage() {
            localStorage.setItem('userInfo', JSON.stringify(this.data));
        },
        
        loadFromLocalStorage() {
            const saved = localStorage.getItem('userInfo');
            if (saved) {
                this.data = JSON.parse(saved);
            }
        },
        
        init() {
            this.loadFromLocalStorage();
        }
    });
    
    // 전역 유틸리티 함수
    Alpine.magic('formatPrice', () => {
        return (price) => {
            return new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: 'KRW'
            }).format(price);
        };
    });
    
    Alpine.magic('validatePhone', () => {
        return (phone) => {
            const regex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
            return regex.test(phone.replace(/-/g, ''));
        };
    });
});

// 재사용 가능한 Alpine 컴포넌트들

// 모달 컴포넌트
Alpine.data('modal', () => ({
    isOpen: false,
    
    open() {
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
    },
    
    close() {
        this.isOpen = false;
        document.body.style.overflow = '';
    },
    
    toggle() {
        this.isOpen ? this.close() : this.open();
    }
}));

// 탭 컴포넌트
Alpine.data('tabs', (defaultTab = 0) => ({
    activeTab: defaultTab,
    
    isActive(index) {
        return this.activeTab === index;
    },
    
    setActive(index) {
        this.activeTab = index;
    }
}));

// 드롭다운 컴포넌트
Alpine.data('dropdown', () => ({
    isOpen: false,
    
    toggle() {
        this.isOpen = !this.isOpen;
    },
    
    close() {
        this.isOpen = false;
    }
}));

// 카운터 컴포넌트
Alpine.data('counter', (initialValue = 1, min = 1, max = 999) => ({
    count: initialValue,
    min: min,
    max: max,
    
    increment() {
        if (this.count < this.max) {
            this.count++;
        }
    },
    
    decrement() {
        if (this.count > this.min) {
            this.count--;
        }
    },
    
    updateValue(value) {
        const num = parseInt(value);
        if (!isNaN(num)) {
            this.count = Math.max(this.min, Math.min(this.max, num));
        }
    }
}));

// 폼 밸리데이션 컴포넌트
Alpine.data('formValidation', () => ({
    errors: {},
    
    validateField(field, value, rules) {
        this.errors[field] = [];
        
        // 필수 입력 검사
        if (rules.required && !value) {
            this.errors[field].push('필수 입력 항목입니다.');
        }
        
        // 최소 길이 검사
        if (rules.minLength && value.length < rules.minLength) {
            this.errors[field].push(`최소 ${rules.minLength}자 이상 입력해주세요.`);
        }
        
        // 최대 길이 검사
        if (rules.maxLength && value.length > rules.maxLength) {
            this.errors[field].push(`최대 ${rules.maxLength}자까지 입력 가능합니다.`);
        }
        
        // 이메일 형식 검사
        if (rules.email && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.errors[field].push('올바른 이메일 형식이 아닙니다.');
            }
        }
        
        // 전화번호 형식 검사
        if (rules.phone && value) {
            const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
            if (!phoneRegex.test(value.replace(/-/g, ''))) {
                this.errors[field].push('올바른 전화번호 형식이 아닙니다.');
            }
        }
        
        // URL 형식 검사
        if (rules.url && value) {
            try {
                new URL(value);
            } catch {
                this.errors[field].push('올바른 URL 형식이 아닙니다.');
            }
        }
        
        // 에러가 없으면 배열 제거
        if (this.errors[field].length === 0) {
            delete this.errors[field];
        }
        
        return this.errors[field] === undefined;
    },
    
    hasError(field) {
        return this.errors[field] && this.errors[field].length > 0;
    },
    
    getError(field) {
        return this.errors[field] ? this.errors[field][0] : '';
    },
    
    clearErrors() {
        this.errors = {};
    }
}));

// 스크롤 애니메이션 컴포넌트
Alpine.data('scrollAnimation', () => ({
    shown: false,
    
    init() {
        // Intersection Observer 설정
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.shown = true;
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        
        observer.observe(this.$el);
    }
}));

// 가격 계산기 컴포넌트
Alpine.data('priceCalculator', () => ({
    selectedPackage: null,
    period: 10,
    quantity: 1,
    additionalOptions: [],
    
    get basePrice() {
        return this.selectedPackage?.price || 0;
    },
    
    get periodMultiplier() {
        return this.period / 10; // 10일 기준
    },
    
    get optionsPrice() {
        return this.additionalOptions.reduce((sum, option) => {
            return sum + (option.price * option.quantity || 0);
        }, 0);
    },
    
    get totalPrice() {
        const packageTotal = this.basePrice * this.quantity * this.periodMultiplier;
        return packageTotal + this.optionsPrice;
    },
    
    get formattedTotalPrice() {
        return this.$formatPrice(this.totalPrice);
    },
    
    selectPackage(pkg) {
        this.selectedPackage = pkg;
    },
    
    toggleOption(option) {
        const index = this.additionalOptions.findIndex(opt => opt.id === option.id);
        if (index > -1) {
            this.additionalOptions.splice(index, 1);
        } else {
            this.additionalOptions.push({ ...option, quantity: 1 });
        }
    }
}));

// 초기화 시 스토어 로드
document.addEventListener('DOMContentLoaded', () => {
    // 스토어 초기화
    Alpine.store('cart').init();
    Alpine.store('user').init();
});
