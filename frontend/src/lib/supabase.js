// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Lee las variables de entorno definidas en .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Si faltan, solo muestra un warning (no rompe la app)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY')
}

// Crea el cliente para interactuar con la BD
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

/* 
  === Ejemplo de uso ===

  import { supabase } from '../lib/supabase.js'

  async function cargarSimulaciones() {
    const { data, error } = await supabase
      .from('simulaciones')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error(error)
    else console.log(data)
  }

  cargarSimulaciones()
*/
