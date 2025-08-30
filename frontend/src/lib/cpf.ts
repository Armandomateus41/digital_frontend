export function normalizeCPF(input: string): string {
  return (input || '').replace(/\D+/g, '')
}

export function isValidCPF(input: string): boolean {
  const cpf = normalizeCPF(input)
  if (!cpf || cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false

  const calcCheckDigit = (base: string, factorStart: number): number => {
    let sum = 0
    for (let i = 0; i < base.length; i++) {
      sum += Number(base[i]) * (factorStart - i)
    }
    const remainder = (sum * 10) % 11
    return remainder === 10 ? 0 : remainder
  }

  const d1 = calcCheckDigit(cpf.slice(0, 9), 10)
  const d2 = calcCheckDigit(cpf.slice(0, 10), 11)

  return d1 === Number(cpf[9]) && d2 === Number(cpf[10])
}


