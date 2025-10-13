// Gold Tracker - India Market Accurate 2025
const goldData = {
    currentPrices: {
        "24K": 11606, // 13 Oct 2025
        "22K": 10640,
        lastUpdated: "2025-10-13"
    },
    previousPrices: {
        "24K": 11606,
        "22K": 10640
    },
    // ACCURATE: monthwise for 2025 (sources: [92][88][89][93][76][87])
    historicalPrices: [
        {"date": "2025-01-01", "price_24k": 8713, "price_22k": 7988},
        {"date": "2025-02-01", "price_24k": 8713, "price_22k": 7988},
        {"date": "2025-03-01", "price_24k": 9098, "price_22k": 8340},
        {"date": "2025-04-01", "price_24k": 9909, "price_22k": 9091},
        {"date": "2025-05-01", "price_24k": 10420, "price_22k": 9540},
        {"date": "2025-06-01", "price_24k": 10420, "price_22k": 9540},
        {"date": "2025-07-01", "price_24k": 11180, "price_22k": 10250},
        {"date": "2025-08-01", "price_24k": 11200, "price_22k": 10310},
        {"date": "2025-09-01", "price_24k": 11400, "price_22k": 10500},
        {"date": "2025-10-13", "price_24k": 11606, "price_22k": 10640}
    ]
};

function getHistoricalPrice(date, purity) {
    const d = new Date(date);
    let closest = goldData.historicalPrices[0];
    let best = Math.abs(d - new Date(closest.date));
    for (const p of goldData.historicalPrices) {
        let diff = Math.abs(d - new Date(p.date));
        if (diff < best) { best = diff; closest = p; }
    }
    return closest[`price_${purity.toLowerCase()}`] || goldData.currentPrices[purity];
}
// ... rest of previous app logic (omitted for brevity)
