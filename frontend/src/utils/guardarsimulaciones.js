import Cookies from 'js-cookie';

export function guardarsimulacion(simulacion) {
  const anteriores = JSON.parse(Cookies.get('simulaciones') || '[]');
  const nuevas = [...anteriores, simulacion];
  Cookies.set('simulaciones', JSON.stringify(nuevas), { expires: 7 });
}
