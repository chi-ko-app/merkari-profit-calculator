// ========================================
// DOM要素の取得
// ========================================

const sellingPriceInput = document.getElementById('sellingPrice');
const shippingOptions = document.querySelectorAll('input[name="shipping"]');
const customShippingInput = document.getElementById('customShipping');
const mercariFeeCopy = document.getElementById('mercariFeeCopy');
const shippingFeeCopy = document.getElementById('shippingFeeCopy');
const profitWidget = document.getElementById('profitWidget');
const profitRateWidget = document.getElementById('profitRateWidget');
const errorMessage = document.getElementById('errorMessage');
const customShippingCard = document.getElementById('customShippingCard');

// ========================================
// 定数の定義
// ========================================

const MERCARI_FEE_RATE = 0.1;

// ========================================
// イベントリスナーの登録
// ========================================

sellingPriceInput.addEventListener('input', calculateProfit);

shippingOptions.forEach(option => {
    option.addEventListener('change', handleShippingChange);
});

customShippingInput.addEventListener('input', calculateProfit);

// ========================================
// 配送方法が変更されたときの処理
// ========================================

function handleShippingChange(event) {
    const selectedValue = event.target.value;

    if (selectedValue === 'custom') {
        // カスタム送料のカード全体を活性化
        customShippingCard.classList.add('active');
        customShippingInput.focus();
    } else {
        customShippingCard.classList.remove('active');
    }

    calculateProfit();
}

// ========================================
// 利益を計算して表示する関数
// ========================================

function calculateProfit() {
    // ステップ1: 入力値を取得
    const sellingPrice = parseFloat(sellingPriceInput.value) || 0;

    // ステップ2: 配送方法を確認
    const selectedShipping = document.querySelector('input[name="shipping"]:checked');
    if (!selectedShipping) {
        showError('配送方法を選択してください');
        clearResults();
        return;
    }

    const shippingValue = selectedShipping.value;
    let shippingCost = 0;

    // ステップ3: 送料を確定
    if (shippingValue === 'custom') {
        shippingCost = parseFloat(customShippingInput.value) || 0;
        if (shippingCost === 0 && customShippingInput.value === '') {
            showError('送料を入力してください');
            clearResults();
            return;
        }
    } else {
        shippingCost = parseFloat(shippingValue);
    }

    // ステップ4: バリデーション
    if (sellingPrice <= 0) {
        showError('売値は1円以上で入力してください');
        clearResults();
        return;
    }

    if (shippingCost < 0) {
        showError('送料に負の数は入力できません');
        clearResults();
        return;
    }

    // ステップ5: メルカリ手数料を計算
    const mercariFee = Math.round(sellingPrice * MERCARI_FEE_RATE);

    // ステップ6: 利益を計算
    const profit = Math.round(sellingPrice - mercariFee - shippingCost);

    // ステップ7: 利益率を計算
    let profitRate = 0;
    if (sellingPrice > 0) {
        profitRate = ((profit / sellingPrice) * 100).toFixed(1);
    }

    // ステップ8: 結果を表示
    hideError();

    // ウィジェットに大きく表示
    profitWidget.textContent = '¥' + profit.toLocaleString();
    profitRateWidget.textContent = profitRate + '%';

    // 詳細に表示
    mercariFeeCopy.textContent = '¥' + mercariFee.toLocaleString();
    shippingFeeCopy.textContent = '¥' + Math.round(shippingCost).toLocaleString();
}

// ========================================
// エラーメッセージ表示・非表示
// ========================================

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

// ========================================
// 計算結果をクリア
// ========================================

function clearResults() {
    profitWidget.textContent = '¥0';
    profitRateWidget.textContent = '0%';
    mercariFeeCopy.textContent = '¥0';
    shippingFeeCopy.textContent = '¥0';
}
