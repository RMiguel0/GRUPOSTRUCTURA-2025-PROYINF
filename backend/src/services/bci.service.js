// backend/src/services/bci.service.js
import axios from 'axios';

const bciClient = axios.create({
  baseURL: process.env.BCI_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-apikey': process.env.BCI_API_KEY,
    Referer: process.env.BCI_REFERER ?? 'http://localhost:5173',
  },
});

// payload de prueba básico
const defaultBody = {
  DocumentNumber: '25263437-1',
  Name: 'Test',
  LastName: 'User',
  PhoneNumber: '+56912345678',
  Email: 'test@test.cl',
  RequestedAmount: 1000000,
  TotalInstallments: 24,
  FirstInstallmentDate: {
    Day: '29',
    Month: '12',
    Year: '2025',
  },
  SkippedMonths: [0],
  Salary: 1200000,
  Insurances: {
    ReliefInsurance: false,
    UnemploymentInsurance: false,
    HealthInsurance: false,
  },
};

export async function callPublicSimulation(bodyOverride = {}) {
  const payload = { ...defaultBody, ...bodyOverride };

  const res = await bciClient.post('/public-simulation/simulate', payload);
  return res.data;
}
