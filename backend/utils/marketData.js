import axios from 'axios';

/**
 * Obtiene información actualizada del mercado de póker
 * Si no puede conectarse a una API externa, usa datos predeterminados
 */
export const getPokerMarketInfo = async () => {
  try {
    // Aquí podrías integrar con una API real de información de póker
    // Este es un placeholder - reemplazar con API real cuando esté disponible
    
    // Comenta estas líneas si no tienes una API real
    // const response = await axios.get('https://api.example.com/poker/market');
    // return response.data;
    
    // Datos de muestra (mock)
    return {
      tournaments: [
        { name: "Sunday Million", platform: "PokerStars", prize: "$1M garantizado", startDate: "2025-05-19" },
        { name: "Super MILLION$", platform: "GGPoker", prize: "$2M garantizado", startDate: "2025-05-18" },
        { name: "WCOOP Main Event", platform: "PokerStars", prize: "$5M garantizado", startDate: "2025-06-01" },
        { name: "WSOP Online", platform: "GGPoker", prize: "$10M garantizado", startDate: "2025-06-15" }
      ],
      trending_games: ["No-Limit Hold'em", "Pot-Limit Omaha", "Short Deck", "5-Card PLO"],
      popular_strategies: ["GTO play", "Estrategias explotativas", "Rango de 3-bet/4-bet", "Defensa del BB"],
      rakeback_deals: [
        { platform: "PokerStars", percentage: "25-30%", conditions: "Nivel VIP Platino o superior" },
        { platform: "GGPoker", percentage: "15-60%", conditions: "Sistema Fish Buffet" },
        { platform: "PartyPoker", percentage: "20-40%", conditions: "Según nivel de actividad" }
      ],
      bankroll_recommendations: {
        micro: "20 buy-ins mínimo (hasta $0.25/$0.50)",
        low: "30 buy-ins mínimo ($0.5/$1 - $2/$5)",
        mid: "40 buy-ins mínimo ($5/$10 - $10/$20)",
        high: "50 buy-ins mínimo ($25/$50+)"
      }
    };
  } catch (error) {
    console.error('Error obteniendo datos del mercado:', error);
    // Datos de respaldo en caso de error
    return {
      tournaments: [
        { name: "Sunday Million", platform: "PokerStars", prize: "$1M garantizado" },
        { name: "Super MILLION$", platform: "GGPoker", prize: "$2M garantizado" }
      ],
      trending_games: ["No-Limit Hold'em", "Pot-Limit Omaha"],
      popular_strategies: ["GTO play", "Estrategias explotativas"]
    };
  }
};