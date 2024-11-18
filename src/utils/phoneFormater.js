export function formatPhoneNumber(phoneNumber) {
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');

    if (cleaned.length === 11 && cleaned.startsWith('1')) {
        const match = cleaned.match(/^1(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
        }
    }

    if (cleaned.length === 13 && cleaned.startsWith('54')) {
        const match = cleaned.match(/^54(\d)(\d{4})(\d{2})(\d{4})$/);
        if (match) {
            return `+54 ${match[1]} ${match[2]} ${match[3]}-${match[4]}`;
        }
    }

    return phoneNumber;
}