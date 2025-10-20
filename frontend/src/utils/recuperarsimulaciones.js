import Cookies from 'js-cookie';

export function recuperarsimulaciones() {
  return JSON.parse(Cookies.get('simulaciones') || '[]');
}
