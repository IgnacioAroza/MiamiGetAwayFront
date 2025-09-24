import { formatDateToString, parseStringToDate } from './dateUtils';

// Convierte a número si es posible; si no, devuelve undefined
export const numberOrUndefined = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return isNaN(n) ? undefined : n;
};

// Quita las propiedades con valor undefined (conserva 0 y false)
export const stripUndefined = (obj) => Object.fromEntries(
  Object.entries(obj).filter(([, v]) => v !== undefined)
);

// Normaliza fechas a formato MM-DD-YYYY HH:mm si existe valor
export const normalizeDateField = (date) => {
  if (!date) return undefined;
  // Acepta Date, string en formato propio o ISO; convierte a nuestro formato
  const d = parseStringToDate(date) || new Date(date);
  if (isNaN(d?.getTime?.())) return undefined;
  return formatDateToString(d);
};

// Normaliza datos de reserva de la UI para el backend
export const normalizeReservationInput = (reservationData = {}, { partial = false } = {}) => {
  // Campos básicos y numéricos en camelCase
  const base = {
    apartmentId: numberOrUndefined(reservationData.apartmentId),
    clientId: numberOrUndefined(reservationData.clientId),

    checkInDate: normalizeDateField(reservationData.checkInDate),
    checkOutDate: normalizeDateField(reservationData.checkOutDate),

    nights: numberOrUndefined(reservationData.nights),
    pricePerNight: numberOrUndefined(reservationData.price ?? reservationData.pricePerNight),
    cleaningFee: numberOrUndefined(reservationData.cleaningFee),
    cancellationFee: numberOrUndefined(reservationData.cancellationFee),
    parkingFee: numberOrUndefined(reservationData.parkingFee),
    otherExpenses: numberOrUndefined(reservationData.otherExpenses),
    taxes: numberOrUndefined(reservationData.taxes),
    totalAmount: numberOrUndefined(reservationData.totalAmount),
    amountPaid: numberOrUndefined(reservationData.amountPaid),
    amountDue: numberOrUndefined(reservationData.amountDue),

    notes: reservationData.notes,
    status: reservationData.status,
    paymentStatus: reservationData.paymentStatus,
  };

  // Datos del cliente: solo incluir si NO hay clientId definido (creación de cliente inline)
  const clientFields = (!reservationData.clientId) ? {
    clientName: reservationData.clientName,
    clientLastname: reservationData.clientLastname,
    clientEmail: reservationData.clientEmail,
    clientPhone: reservationData.clientPhone,
    clientAddress: reservationData.clientAddress,
    clientCity: reservationData.clientCity,
    clientCountry: reservationData.clientCountry,
    clientNotes: reservationData.clientNotes,
  } : {};

  // Incluir initialPayment si existe (para reservas nuevas con pago inicial)
  const initialPaymentField = reservationData.initialPayment ? {
    initialPayment: reservationData.initialPayment
  } : {};

  const merged = { ...base, ...clientFields, ...initialPaymentField };

  // Para peticiones parciales, remover undefined; para creación también conviene limpiar
  return stripUndefined(merged);
};

// Normaliza respuesta de API de reserva a camelCase (tolerante a snake_case)
export const normalizeReservationFromApi = (data = {}) => {
  if (!data || typeof data !== 'object') return {};
  const pick = (camel, snake, fallback = undefined) => data[camel] ?? data[snake] ?? fallback;

  return {
    id: pick('id', 'id'),
    apartmentId: pick('apartmentId', 'apartment_id'),
    clientId: pick('clientId', 'client_id'),

    clientName: pick('clientName', 'client_name', ''),
    clientLastname: pick('clientLastname', 'client_lastname', ''),
    clientEmail: pick('clientEmail', 'client_email', ''),
    clientPhone: pick('clientPhone', 'client_phone', ''),
    clientAddress: pick('clientAddress', 'client_address', ''),
    clientCity: pick('clientCity', 'client_city', ''),
    clientCountry: pick('clientCountry', 'client_country', ''),
    clientNotes: pick('clientNotes', 'client_notes', ''),

    checkInDate: pick('checkInDate', 'check_in_date'),
    checkOutDate: pick('checkOutDate', 'check_out_date'),
    nights: pick('nights', 'nights'),

    pricePerNight: pick('pricePerNight', 'price_per_night'),
    cleaningFee: pick('cleaningFee', 'cleaning_fee'),
    cancellationFee: pick('cancellationFee', 'cancellation_fee'),
    parkingFee: pick('parkingFee', 'parking_fee'),
    otherExpenses: pick('otherExpenses', 'other_expenses'),
    taxes: pick('taxes', 'taxes'),
    totalAmount: pick('totalAmount', 'total_amount'),
    amountPaid: pick('amountPaid', 'amount_paid'),
    amountDue: pick('amountDue', 'amount_due'),

    status: pick('status', 'status'),
    paymentStatus: pick('paymentStatus', 'payment_status'),

    createdAt: pick('createdAt', 'created_at'),
    updatedAt: pick('updatedAt', 'updated_at'),
  };
};

// Normaliza datos de pago a formato envío
export const normalizePaymentInput = (paymentData = {}) => {
  const amount = numberOrUndefined(paymentData.amount);
  return stripUndefined({
    amount,
    paymentMethod: paymentData.paymentMethod || paymentData.payment_method,
    paymentDate: normalizeDateField(paymentData.paymentDate || paymentData.payment_date),
    notes: paymentData.notes,
  });
};

// Normaliza pago desde API a camelCase estándar
export const normalizePaymentFromApi = (data = {}) => {
  if (!data || typeof data !== 'object') return {};
  const pick = (camel, snake, fallback = undefined) => data[camel] ?? data[snake] ?? fallback;
  return {
    id: pick('id', 'id'),
    reservationId: pick('reservationId', 'reservation_id'),
    clientId: pick('clientId', 'client_id'),
    amount: numberOrUndefined(pick('amount', 'amount')) ?? 0,
    paymentMethod: pick('paymentMethod', 'payment_method') || 'other',
    paymentDate: pick('paymentDate', 'payment_date'),
    notes: pick('notes', 'notes') || '',
  };
};

// Normaliza apartment desde API a camelCase
export const normalizeApartmentFromApi = (data = {}) => {
  if (!data || typeof data !== 'object') return {};
  const pick = (camel, snake, fallback = undefined) => data[camel] ?? data[snake] ?? fallback;
  return {
    id: pick('id', 'id'),
    name: pick('name', 'building_name') || pick('title', 'title') || '',
    unitNumber: pick('unitNumber', 'unit_number') || '',
    address: pick('address', 'address') || pick('location', 'location') || '',
    description: pick('description', 'description') || pick('desc', 'desc') || pick('about', 'about') || '',
    capacity: numberOrUndefined(pick('capacity', 'capacity')) ?? 0,
    bathrooms: numberOrUndefined(pick('bathrooms', 'bathrooms') ?? pick('bathroom_count', 'bathroom_count')) ?? 0,
    rooms: numberOrUndefined(pick('rooms', 'rooms') ?? pick('bedrooms', 'bedrooms') ?? pick('bedroom_count', 'bedroom_count')) ?? 0,
    price: numberOrUndefined(pick('price', 'price')) ?? 0,
    images: pick('images', 'images') || [],
  };
};

// Normaliza items de servicios según tipo
export const normalizeServiceItemFromApi = (serviceType, data = {}) => {
  if (!data || typeof data !== 'object') return {};
  switch (serviceType) {
    case 'cars':
      return {
        id: data.id,
        brand: data.brand || data.make || '',
        model: data.model || '',
        description: data.description || data.desc || '',
        price: numberOrUndefined(data.price) ?? 0,
        passengers: numberOrUndefined(data.passengers) ?? 0,
        images: data.images || [],
      };
    case 'yachts':
      return {
        id: data.id,
        name: data.name || '',
        description: data.description || data.desc || '',
        capacity: numberOrUndefined(data.capacity) ?? 0,
        price: numberOrUndefined(data.price) ?? 0,
        images: data.images || [],
      };
    case 'apartments':
      return normalizeApartmentFromApi(data);
    case 'villas':
      return {
        id: data.id,
        name: data.name || '',
        description: data.description || data.desc || '',
        address: data.address || data.location || '',
        capacity: numberOrUndefined(data.capacity) ?? 0,
        bathrooms: numberOrUndefined(data.bathrooms) ?? 0,
        rooms: numberOrUndefined(data.rooms ?? data.bedrooms) ?? 0,
        price: numberOrUndefined(data.price) ?? 0,
        images: data.images || [],
      };
    default:
      return { ...data };
  }
};

// Normaliza usuario desde API a un esquema coherente
export const normalizeUserFromApi = (data = {}) => {
  if (!data || typeof data !== 'object') return {};
  const pick = (camel, snake, fallback = undefined) => data[camel] ?? data[snake] ?? fallback;
  return {
    id: pick('id', 'id'),
    name: pick('name', 'first_name') || pick('clientName', 'client_name') || '',
    lastname: pick('lastname', 'last_name') || pick('clientLastname', 'client_lastname') || '',
    email: pick('email', 'email') || pick('clientEmail', 'client_email') || '',
    phone: pick('phone', 'phone') || pick('clientPhone', 'client_phone') || '',
    address: pick('address', 'address') || pick('clientAddress', 'client_address') || '',
    city: pick('city', 'city') || pick('clientCity', 'client_city') || '',
    country: pick('country', 'country') || pick('clientCountry', 'client_country') || '',
    notes: pick('notes', 'notes') || pick('clientNotes', 'client_notes') || '',
  };
};
