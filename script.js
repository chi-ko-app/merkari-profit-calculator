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
const saveBtn = document.getElementById('saveBtn');
const darkModeBtn = document.getElementById('darkModeBtn');
const settingsBtn = document.getElementById('settingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const settingsOverlay = document.getElementById('settingsOverlay');
const historyContainer = document.getElementById('historyContainer');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const themeButtons = document.querySelectorAll('.theme-btn');
const fontButtons = document.querySelectorAll('.font-btn');
const fontColorButtons = document.querySelectorAll('.font-color-btn');
const chartTabs = document.querySelectorAll('.chart-tab');

// ========================================
// 定数
// ========================================

const MERCARI_FEE_RATE = 0.1;

// ========================================
// 初期化
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadHistory();
    setupEventListeners();
    updateHistoryDisplay();
});

// ========================================
// イベントリスナー
// ========================================

function setupEventListeners() {
    sellingPriceInput.addEventListener('input', calculateProfit);
    shippingOptions.forEach(option => {
        option.addEventListener('change', handleShippingChange);
    });
    customShippingInput.addEventListener('input', calculateProfit);
    saveBtn.addEventListener('click', saveResult);
    darkModeBtn.addEventListener('click', toggleDarkMode);
    settingsBtn.addEventListener('click', openSettings);
    closeSettingsBtn.addEventListener('click', closeSettings);
    settingsOverlay.addEventListener('click', closeSettings);
    clearHistoryBtn.addEventListener('click', clearHistory);

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => changeTheme(btn.dataset.theme));
    });

    fontButtons.forEach(btn => {
        btn.addEventListener('click', () => changeFont(btn.dataset.font));
    });

    fontColorButtons.forEach(btn => {
        btn.addEventListener('click', () => changeFontColor(btn.dataset.color));
    });

    chartTabs.forEach(tab => {
        tab.addEventListener('click', () => showChart(tab.dataset.chart));
    });
}

// ========================================
// 配送方法の変更
// ========================================

function handleShippingChange(event) {
    const selectedValue = event.target.value;
    const customShippingCard = document.getElementById('customShippingCard');

    if (selectedValue === 'custom') {
        customShippingCard.classList.add('active');
        customShippingInput.focus();
    } else {
        customShippingCard.classList.remove('active');
    }

    calculateProfit();
}

// ========================================
// 利益計算
// ========================================

function calculateProfit() {
    const sellingPrice = parseFloat(sellingPriceInput.value) || 0;
    const selectedShipping = document.querySelector('input[name="shipping"]:checked');

    if (!selectedShipping) {
        showError('配送方法を選択してください');
        clearResults();
        return;
    }

    const shippingValue = selectedShipping.value;
    let shippingCost = 0;

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

    const mercariFee = Math.round(sellingPrice * MERCARI_FEE_RATE);
    const profit = Math.round(sellingPrice - mercariFee - shippingCost);
    let profitRate = 0;

    if (sellingPrice > 0) {
        profitRate = ((profit / sellingPrice) * 100).toFixed(1);
    }

    hideError();

    profitWidget.textContent = '¥' + profit.toLocaleString();
    profitRateWidget.textContent = profitRate + '%';
    mercariFeeCopy.textContent = '¥' + mercariFee.toLocaleString();
    shippingFeeCopy.textContent = '¥' + Math.round(shippingCost).toLocaleString();
}

// ========================================
// 結果の保存
// ========================================

function saveResult() {
    const sellingPrice = parseFloat(sellingPriceInput.value);
    const profit = parseInt(profitWidget.textContent.replace(/¥|,/g, ''));

    if (!sellingPrice || profit === undefined) {
        showError('計算してから保存してください');
        return;
    }

    const history = getHistory();
    const today = new Date().toLocaleDateString('ja-JP');

    history.push({
        date: today,
        timestamp: new Date().getTime(),
        sellingPrice,
        profit,
        profitRate: parseFloat(profitRateWidget.textContent),
    });

    localStorage.setItem('profitHistory', JSON.stringify(history));
    updateHistoryDisplay();

    showError('✅ 保存しました！');
    setTimeout(() => hideError(), 2000);
}

// ========================================
// 履歴管理
// ========================================

function getHistory() {
    const stored = localStorage.getItem('profitHistory');
    return stored ? JSON.parse(stored) : [];
}

function updateHistoryDisplay() {
    const history = getHistory();

    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="empty-message">履歴はまだありません</p>';
        return;
    }

    historyContainer.innerHTML = history.reverse().map(item => `
        <div class="history-item">
            <div>
                <div style="font-size: 14px; margin-bottom: 4px;">¥${item.sellingPrice.toLocaleString()}</div>
                <div class="history-date">${item.date}</div>
            </div>
            <div class="history-amount">¥${item.profit.toLocaleString()}</div>
        </div>
    `).join('');
}

function clearHistory() {
    if (confirm('本当に削除しますか？')) {
        localStorage.removeItem('profitHistory');
        updateHistoryDisplay();
    }
}

// ========================================
// 設定画面
// ========================================

function openSettings() {
    settingsPanel.classList.add('active');
    settingsOverlay.classList.add('active');
}

function closeSettings() {
    settingsPanel.classList.remove('active');
    settingsOverlay.classList.remove('active');
}

// ========================================
// テーマ変更
// ========================================

function changeTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // ボタンのアクティブ状態を更新
    themeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        }
    });

    updateChart();
}

// ========================================
// フォント変更
// ========================================

function changeFont(font) {
    document.documentElement.setAttribute('data-font', font);
    localStorage.setItem('font', font);

    fontButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.font === font) {
            btn.classList.add('active');
        }
    });
}

// ========================================
// フォントカラー変更
// ========================================

function changeFontColor(color) {
    document.documentElement.setAttribute('data-font-color', color);
    localStorage.setItem('fontColor', color);

    fontColorButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.color === color) {
            btn.classList.add('active');
        }
    });
}

// ========================================
// グラフ
// ========================================

let chartInstance = null;

function showChart(type) {
    // タブの更新
    chartTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.chart === type) {
            tab.classList.add('active');
        }
    });

    updateChart(type);
}

function updateChart(type = 'daily') {
    const history = getHistory();
    const ctx = document.getElementById('profitChart').getContext('2d');

    let labels, data;

    if (type === 'daily') {
        // 日別集計
        const dailyData = {};
        history.forEach(item => {
            if (!dailyData[item.date]) {
                dailyData[item.date] = 0;
            }
            dailyData[item.date] += item.profit;
        });

        labels = Object.keys(dailyData);
        data = Object.values(dailyData);
    } else {
        // 月別集計
        const monthlyData = {};
        history.forEach(item => {
            const month = item.date.substring(0, 7);
            if (!monthlyData[month]) {
                monthlyData[month] = 0;
            }
            monthlyData[month] += item.profit;
        });

        labels = Object.keys(monthlyData);
        data = Object.values(monthlyData);
    }

    if (chartInstance) {
        chartInstance.destroy();
    }

    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length > 0 ? labels : ['データなし'],
            datasets: [{
                label: '利益',
                data: data.length > 0 ? data : [0],
                borderColor: accentColor,
                backgroundColor: accentColor + '20',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointBackgroundColor: accentColor,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });
}

// ========================================
// ダークモード
// ========================================

function toggleDarkMode() {
    const isDarkMode = document.body.getAttribute('data-dark-mode') === 'true';
    const newMode = !isDarkMode;

    document.body.setAttribute('data-dark-mode', newMode);
    localStorage.setItem('darkMode', newMode);

    // ボタンのアイコンを更新
    darkModeBtn.textContent = newMode ? '☀️' : '🌙';

    // チャートを更新
    if (window.chartInstance) {
        updateChart();
    }
}

// ========================================
// 設定の保存と読み込み
// ========================================

function loadSettings() {
    const savedTheme = localStorage.getItem('theme') || 'pink';
    const savedFont = localStorage.getItem('font') || 'noto';
    const savedFontColor = localStorage.getItem('fontColor') || 'black';
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';

    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-font', savedFont);
    document.documentElement.setAttribute('data-font-color', savedFontColor);
    document.body.setAttribute('data-dark-mode', savedDarkMode);

    // ダークモードボタンのアイコンを更新
    darkModeBtn.textContent = savedDarkMode ? '☀️' : '🌙';

    // アクティブボタンを更新
    themeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === savedTheme) {
            btn.classList.add('active');
        }
    });

    fontButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.font === savedFont) {
            btn.classList.add('active');
        }
    });

    fontColorButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.color === savedFontColor) {
            btn.classList.add('active');
        }
    });
}

function loadHistory() {
    updateHistoryDisplay();
    setTimeout(() => {
        updateChart('daily');
    }, 500);
}

// ========================================
// ユーティリティ
// ========================================

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function clearResults() {
    profitWidget.textContent = '¥0';
    profitRateWidget.textContent = '0%';
    mercariFeeCopy.textContent = '¥0';
    shippingFeeCopy.textContent = '¥0';
}
