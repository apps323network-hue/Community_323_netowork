export async function fetchExchangeRate(): Promise<number> {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
        const data = await response.json()
        return data.rates.BRL || 5.95 // Fallback value
    } catch (error) {
        console.error('Error fetching exchange rate:', error)
        return 5.95 // Fallback value
    }
}

export function calculatePixAmount(usdAmount: number, rate: number): number {
    const PIX_FEE_PERCENTAGE = 0.0179
    const RATE_MARGIN = 1.04

    const rateWithMargin = rate * RATE_MARGIN
    const netAmountBRL = usdAmount * rateWithMargin
    const grossAmountBRL = netAmountBRL / (1 - PIX_FEE_PERCENTAGE)

    return grossAmountBRL
}
