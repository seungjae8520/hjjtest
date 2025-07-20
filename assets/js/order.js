/**
 * 내가올려.kr - 주문서 처리 JavaScript
 * 
 * 주요 기능:
 * 1. sessionStorage에서 주문 데이터 로드
 * 2. 주문서 폼 검증
 * 3. 주소 검색 (다음 우편번호 API)
 * 4. 주문 데이터 서버 전송
 */

// Alpine.js 컴포넌트로 주문 처리 등록
document.addEventListener('alpine:init', () => {
    Alpine.data('orderForm', () => ({
        // 폼 데이터
        formData: {
            // 기본 정보
            businessName: '',
            ownerName: '',
            businessNumber: '',
            
            // 연락처 정보
            phone: '',
            email: '',
            
            // 사업장 정보
            postalCode: '',
            address: '',
            addressDetail: '',
            websiteUrl: '',
            
            // 추가 요청사항
            additionalRequest: ''
        },
        
        // 약관 동의
        agreements: {
            terms: false,
            privacy: false,
            marketing: false,
            all: false
        },
        
        // 주문 정보 (sessionStorage에서 로드)
        orderData: null,
        
        // 폼 상태
        isSubmitting: false,
        
        // 초기화
        init() {
            // sessionStorage에서 주문 데이터 로드
            this.loadOrderData();
            
            // 개별 약관 동의 감시
            this.$watch('agreements', (agreements) => {
                const { all, ...others } = agreements;
                const allChecked = Object.values(others).every(v => v === true);
                this.agreements.all = allChecked;
            }, { deep: true });
        },
        
        // sessionStorage에서 데이터 로드
        loadOrderData() {
            const savedData = sessionStorage.getItem('orderData');
            if (savedData) {
                try {
                    this.orderData = JSON.parse(savedData);
                    console.log('주문 데이터 로드:', this.orderData);
                } catch (e) {
                    console.error('주문 데이터 로드 실패:', e);
                    this.showError('주문 정보를 불러올 수 없습니다. 다시 시도해주세요.');
                }
            } else {
                // 주문 데이터가 없으면 상품 선택 페이지로 리다이렉트
                this.showError('주문 정보가 없습니다. 상품을 먼저 선택해주세요.');
                setTimeout(() => {
                    window.location.href = '/products.html';
                }, 2000);
            }
        },
        
        // 업종 이름 가져오기
        getBusinessTypeName() {
            if (!this.orderData) return '업종 미선택';
            return this.orderData.businessType === 'restaurant' ? '맛집업종' : '일반업종';
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
        
        // 전화번호 포맷팅
        formatPhoneNumber(event) {
            let value = event.target.value.replace(/[^0-9]/g, '');
            
            if (value.length <= 3) {
                event.target.value = value;
            } else if (value.length <= 7) {
                event.target.value = `${value.slice(0, 3)}-${value.slice(3)}`;
            } else if (value.length <= 11) {
                event.target.value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
            }
            
            this.formData.phone = event.target.value;
        },
        
        // 사업자등록번호 포맷팅
        formatBusinessNumber(event) {
            let value = event.target.value.replace(/[^0-9]/g, '');
            
            if (value.length <= 3) {
                event.target.value = value;
            } else if (value.length <= 5) {
                event.target.value = `${value.slice(0, 3)}-${value.slice(3)}`;
            } else if (value.length <= 10) {
                event.target.value = `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5)}`;
            }
            
            this.formData.businessNumber = event.target.value;
        },
        
        // 주소 검색 (다음 우편번호 API)
        searchAddress() {
            new daum.Postcode({
                oncomplete: (data) => {
                    // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드
                    let addr = ''; // 주소 변수
                    
                    // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
                    if (data.userSelectedType === 'R') { // 도로명 주소
                        addr = data.roadAddress;
                    } else { // 지번 주소
                        addr = data.jibunAddress;
                    }
                    
                    // 우편번호와 주소 정보를 해당 필드에 넣는다.
                    this.formData.postalCode = data.zonecode;
                    this.formData.address = addr;
                    
                    // 상세주소 필드로 포커스 이동
                    document.querySelector('input[x-model="formData.addressDetail"]')?.focus();
                }
            }).open();
        },
        
        // 약관 전체 동의 토글
        toggleAllAgreements() {
            const allChecked = this.agreements.all;
            this.agreements.terms = allChecked;
            this.agreements.privacy = allChecked;
            this.agreements.marketing = allChecked;
        },
        
        // 제출 가능 여부 확인
        canSubmit() {
            return this.agreements.terms && this.agreements.privacy;
        },
        
        // 폼 검증
        validateForm() {
            // 필수 필드 검증
            const required = [
                { field: 'businessName', name: '상호명' },
                { field: 'ownerName', name: '대표자명' },
                { field: 'phone', name: '휴대폰 번호' },
                { field: 'postalCode', name: '우편번호' },
                { field: 'address', name: '주소' }
            ];
            
            for (const item of required) {
                if (!this.formData[item.field]) {
                    this.showError(`${item.name}을(를) 입력해주세요.`);
                    const input = document.querySelector(`[x-model="formData.${item.field}"]`);
                    if (input) input.focus();
                    return false;
                }
            }
            
            // 사업자등록번호 형식 검증 (입력된 경우)
            if (this.formData.businessNumber) {
                const businessNumber = this.formData.businessNumber.replace(/-/g, '');
                if (businessNumber.length !== 10) {
                    this.showError('사업자등록번호는 10자리여야 합니다.');
                    document.querySelector('[x-model="formData.businessNumber"]')?.focus();
                    return false;
                }
            }
            
            // 이메일 형식 검증 (입력된 경우)
            if (this.formData.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(this.formData.email)) {
                    this.showError('올바른 이메일 주소를 입력해주세요.');
                    document.querySelector('[x-model="formData.email"]')?.focus();
                    return false;
                }
            }
            
            // 약관 동의 검증
            if (!this.agreements.terms || !this.agreements.privacy) {
                this.showError('필수 약관에 동의해주세요.');
                return false;
            }
            
            return true;
        },
        
        // 주문 제출
        async submitOrder() {
            // 폼 검증
            if (!this.validateForm()) {
                return;
            }
            
            // 중복 제출 방지
            if (this.isSubmitting) {
                return;
            }
            
            this.isSubmitting = true;
            
            try {
                // 주문 데이터 준비
                const orderPayload = {
                    // 고객 정보
                    customer: {
                        businessName: this.formData.businessName,
                        ownerName: this.formData.ownerName,
                        businessNumber: this.formData.businessNumber,
                        phone: this.formData.phone,
                        email: this.formData.email,
                        address: {
                            postalCode: this.formData.postalCode,
                            address: this.formData.address,
                            addressDetail: this.formData.addressDetail
                        },
                        websiteUrl: this.formData.websiteUrl,
                        additionalRequest: this.formData.additionalRequest
                    },
                    // 마케팅 정보
                    marketing: this.orderData,
                    // 약관 동의
                    agreements: this.agreements,
                    // 주문 시간
                    orderedAt: new Date().toISOString()
                };
                
                console.log('주문 데이터:', orderPayload);
                
                // API 호출
                const response = await fetch('/api/order.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderPayload)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                
                if (result.success) {
                    // 성공 메시지
                    this.showSuccess('주문이 성공적으로 접수되었습니다.');
                    
                    // sessionStorage 클리어
                    sessionStorage.removeItem('orderData');
                    
                    // 주문 완료 페이지로 이동
                    setTimeout(() => {
                        window.location.href = `/complete.html?orderId=${result.orderId}`;
                    }, 1500);
                } else {
                    throw new Error(result.message || '주문 처리 중 오류가 발생했습니다.');
                }
            } catch (error) {
                console.error('주문 제출 오류:', error);
                this.showError(error.message || '주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
            } finally {
                this.isSubmitting = false;
            }
        },
        
        // 성공 메시지 표시
        showSuccess(message) {
            // main.js의 showToast 함수 사용
            if (typeof window.showToast === 'function') {
                window.showToast(message, 'success');
            } else {
                alert(message);
            }
        },
        
        // 에러 메시지 표시
        showError(message) {
            // main.js의 showToast 함수 사용
            if (typeof window.showToast === 'function') {
                window.showToast(message, 'error');
            } else {
                alert(message);
            }
        },
        
        // 카카오톡 채팅 열기
        openKakaoChat() {
            window.open('http://pf.kakao.com/_내가올려/chat', '_blank');
        },
        
        // 가격 포맷팅
        formatPrice(price) {
            return new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: 'KRW'
            }).format(price);
        }
    }));
});