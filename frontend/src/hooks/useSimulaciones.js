import { useState } from 'react';
import Cookies from 'js-cookie';

export function useSimulaciones() {
    const [simulaciones, setSimulaciones] = useState([]);

    function guardar(simulacion) {
        try {
            const anteriores = JSON.parse(Cookies.get('simulaciones') || '[]');
            const nuevas = [...anteriores, simulacion];
            Cookies.set('simulaciones', JSON.stringify(nuevas), { expires: 7 });
            console.log('Simulaciones cargadas desde cookies:', nuevas); // ← Aquí
            setSimulaciones(nuevas);
        } catch (error) {
            console.error('Error al guardar simulación:', error);
        }
    }


    function cargar() {
        const guardadas = JSON.parse(Cookies.get('simulaciones') || '[]');
        setSimulaciones(guardadas);
    }

    function eliminar(index) {
        const actuales = JSON.parse(Cookies.get('simulaciones') || '[]');
        actuales.splice(index, 1);
        Cookies.set('simulaciones', JSON.stringify(actuales), { expires: 7 });
        setSimulaciones(actuales);
    }

    return { simulaciones, guardar, cargar, eliminar };
}
