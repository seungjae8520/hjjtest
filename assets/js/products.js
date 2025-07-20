/**
 * 내가올려.kr - 상품 선택 페이지 JavaScript
 * Alpine.js 컴포넌트
 */

// Alpine.js 초기화 시 컴포넌트 등록
document.addEventListener('alpine:init', () => {
    Alpine.data('productApp', productApp);
});

// 상품 선택 전체 로직
function productApp() {
    return {
        // 현재 스텝
        currentStep: 1,
        
        // Step 1: 업종 선택
        businessType: '',
        
        // Step 2: 플랫폼 & 키워드
        selectedPlatforms: [],
        mainKeyword: '',
        subKeywords: [],
        
        // Step 3: 상품 선택 (일반업종)
        selectedProducts: [],
        selectedOptions: [],
        selectedVirals: [],
        
        // 맛집업종 타당 가격제 데이터
        restaurantData: {
            keyword: '',
            products: [],
            trafficCount: 100,
            saveCount: 50,
            navigationCount: 50,
            additionalOptions: [],
            businessName: '',
            phone: ''
        },
        
        // 총 금액
        get totalPrice() {
            if (this.businessType === 'restaurant') {
                return this.calculateRestaurantTotal();
            }
            return this.calculateGeneralTotal();
        },
        
        // 업종 선택
        selectBusinessType(type) {
            this.businessType = type;
        },
        
        // 플랫폼 토글
        togglePlatform(platform) {
            const index = this.selectedPlatforms.indexOf(platform);
            if (index > -1) {
                this.selectedPlatforms.splice(index, 1);
            } else {
                this.selectedPlatforms.push(platform);
            }
        },
        
        // 플랫폼 선택 확인
        isPlatformSelected(platform) {
            return this.selectedPlatforms.includes(platform);
        },
        
        // 플랫폼 이름 변환
        getPlatformName(platform) {
            const names = {
                'naver_place': '네이버 플레이스',
                'blog': '네이버 블로그',
                'instagram': '인스타그램'
            };
            return names[platform] || platform;
        },
        
        // 서브 키워드 추가
        addSubKeyword(event) {
            const value = event.target.value.trim();
            if (value && this.subKeywords.length < 5 && !this.subKeywords.includes(value)) {
                this.subKeywords.push(value);
                event.target.value = '';
            }
        },
        
        // 서브 키워드 제거
        removeSubKeyword(index) {
            this.subKeywords.splice(index, 1);
        },
        
        // 상품 토글
        toggleProduct(productId, price) {
            const index = this.selectedProducts.findIndex(p => p.id === productId);
            if (index > -1) {
                this.selectedProducts.splice(index, 1);
            } else {
                const productNames = {
                    'test': '반영테스트',
                    'standard': '본격적 순위 상승',
                    'premium': '경쟁구간'
                };
                this.selectedProducts.push({
                    id: productId,
                    name: productNames[productId],
                    price: price
                });
            }
        },
        
        // 상품 선택 확인
        isProductSelected(productId) {
            return this.selectedProducts.some(p => p.id === productId);
        },
        
        // 옵션 토글
        toggleOption(optionId, price) {
            const index = this.selectedOptions.findIndex(o => o.id === optionId);
            if (index > -1) {
                this.selectedOptions.splice(index, 1);
            } else {
                const optionNames = {
                    'booster': '순위 부스터',
                    'blog_extra': '블로그 추가'
                };
                this.selectedOptions.push({
                    id: optionId,
                    name: optionNames[optionId],
                    price: price
                });
            }
        },
        
        // 옵션 선택 확인
        isOptionSelected(optionId) {
            return this.selectedOptions.some(o => o.id === optionId);
        },
        
        // 바이럴 패키지 토글
        toggleViralPackage(packageId, price = null) {
            const index = this.selectedVirals.findIndex(v => v.id === packageId);
            if (index > -1) {
                this.selectedVirals.splice(index, 1);
            } else {
                const packages = {
                    'smartblock': { name: '스마트블록', price: price || 500000 },
                    'ai_basic': { name: 'AI 저인망 배포', price: price || 250000 },
                    'momcafe': { name: '맘카페 바이럴', price: price || 400000 }
                };
                
                if (packages[packageId]) {
                    this.selectedVirals.push({
                        id: packageId,
                        ...packages[packageId]
                    });
                }
            }
        },
        
        // 바이럴 선택 확인
        isViralSelected(packageId) {
            return this.selectedVirals.some(v => v.id === packageId);
        },
        
        // 일반업종 총액 계산
        calculateGeneralTotal() {
            let total = 0;
            
            // 기본 상품
            total += this.selectedProducts.reduce((sum, product) => sum + product.price, 0);
            
            // 추가 옵션
            total += this.selectedOptions.reduce((sum, option) => sum + option.price, 0);
            
            // 바이럴 패키지
            total += this.selectedVirals.reduce((sum, viral) => sum + viral.price, 0);
            
            return total;
        },
        
        // 선택 항목이 있는지 확인
        hasAnySelection() {
            return this.selectedProducts.length > 0 || 
                   this.selectedOptions.length > 0 || 
                   this.selectedVirals.length > 0;
        },
        
        // 가격 포맷
        formatPrice(price) {
            return new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: 'KRW'
            }).format(price);
        },
        
        // 다음 스텝
        nextStep() {
            if (this.currentStep < 3) {
                this.currentStep++;
                // 스크롤 위치 상단으로
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },
        
        // 이전 스텝
        previousStep() {
            if (this.currentStep > 1) {
                this.currentStep--;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },
        
        // Step 3로 진행 가능 여부
        canProceedToStep3() {
            return this.selectedPlatforms.length > 0 && this.mainKeyword.trim() !== '';
        },
        
        // 맛집업종 수량 조정
        adjustTrafficCount(amount) {
            this.restaurantData.trafficCount = Math.max(100, this.restaurantData.trafficCount + amount);
        },
        
        adjustSaveCount(amount) {
            this.restaurantData.saveCount = Math.max(50, this.restaurantData.saveCount + amount);
        },
        
        adjustNavigationCount(amount) {
            this.restaurantData.navigationCount = Math.max(50, this.restaurantData.navigationCount + amount);
        },
        
        // 맛집업종 상품 토글
        toggleRestaurantProduct(product) {
            const index = this.restaurantData.products.indexOf(product);
            if (index > -1) {
                this.restaurantData.products.splice(index, 1);
            } else {
                this.restaurantData.products.push(product);
            }
        },
        
        // 맛집업종 추가 옵션 토글
        toggleAdditionalOption(option) {
            const index = this.restaurantData.additionalOptions.indexOf(option);
            if (index > -1) {
                this.restaurantData.additionalOptions.splice(index, 1);
            } else {
                this.restaurantData.additionalOptions.push(option);
            }
        },
        
        // 맛집업종 총 금액 계산
        calculateRestaurantTotal() {
            let total = 0;
            
            // 타당 상품 계산
            if (this.restaurantData.products.includes('traffic')) {
                total += this.restaurantData.trafficCount * 10 * 65;
            }
            if (this.restaurantData.products.includes('save')) {
                total += this.restaurantData.saveCount * 10 * 85;
            }
            if (this.restaurantData.products.includes('navigation')) {
                total += this.restaurantData.navigationCount * 10 * 50;
            }
            
            // 추가 옵션 계산
            if (this.restaurantData.additionalOptions.includes('blog50')) {
                total += 250000;
            }
            if (this.restaurantData.additionalOptions.includes('blog2')) {
                total += 80000;
            }
            
            return total;
        },
        
        // 맛집업종 주문 가능 여부
        canSubmitRestaurantOrder() {
            return this.restaurantData.products.length > 0 && 
                   this.restaurantData.businessName.trim() !== '' && 
                   this.restaurantData.phone.trim() !== '';
        },
        
        // 상담 열기
        openConsultation() {
            // 카카오톡 채널 열기
            window.open('http://pf.kakao.com/_내가올려', '_blank');
        },
        
        // 카카오톡 채팅 열기
        openKakaoChat() {
            window.open('http://pf.kakao.com/_내가올려/chat', '_blank');
        },
        
        // 맛집업종 주문 제출
        async submitRestaurantOrder() {
            if (!this.canSubmitRestaurantOrder()) {
                return;
            }
            
            // 주문 데이터 준비
            const orderData = {
                businessType: 'restaurant',
                keyword: this.restaurantData.keyword,
                products: this.restaurantData.products.map(product => {
                    switch(product) {
                        case 'traffic':
                            return {
                                type: '유입넣기',
                                dailyCount: this.restaurantData.trafficCount,
                                unitPrice: 65,
                                totalPrice: this.restaurantData.trafficCount * 10 * 65
                            };
                        case 'save':
                            return {
                                type: '저장하기',
                                dailyCount: this.restaurantData.saveCount,
                                unitPrice: 85,
                                totalPrice: this.restaurantData.saveCount * 10 * 85
                            };
                        case 'navigation':
                            return {
                                type: '길찾기',
                                dailyCount: this.restaurantData.navigationCount,
                                unitPrice: 50,
                                totalPrice: this.restaurantData.navigationCount * 10 * 50
                            };
                    }
                }),
                additionalOptions: this.restaurantData.additionalOptions,
                totalPrice: this.calculateRestaurantTotal(),
                businessName: this.restaurantData.businessName,
                phone: this.restaurantData.phone
            };
            
            // sessionStorage에 저장
            sessionStorage.setItem('orderData', JSON.stringify(orderData));
            
            // 주문 페이지로 이동
            window.location.href = 'order.html';
        },
        
        // 주문서 작성으로 진행 (일반업종)
        proceedToOrder() {
            if (!this.hasAnySelection()) {
                alert('상품을 선택해주세요.');
                return;
            }
            
            // 선택 데이터를 세션 스토리지에 저장
            const orderData = {
                businessType: this.businessType,
                platforms: this.selectedPlatforms,
                mainKeyword: this.mainKeyword,
                subKeywords: this.subKeywords,
                products: this.selectedProducts,
                options: this.selectedOptions,
                viralPackages: this.selectedVirals,
                totalPrice: this.calculateGeneralTotal()
            };
            
            sessionStorage.setItem('orderData', JSON.stringify(orderData));
            
            // 주문 페이지로 이동
            window.location.href = 'order.html';
        }
    };
}