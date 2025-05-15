import express from 'express';

const router = express.Router();

router.get('/sales', (req, res) => {
  // Datos de ejemplo para métricas
  res.json({
    totalConversations: 25,
    conversationsWithSalesIntent: 10,
    conversionRate: 40,
    averageMessagesUntilPurchaseIntent: 3.5,
    commonKeywordsBeforePurchase: {
      "precio": 8,
      "bonos": 7,
      "rakeback": 5
    },
    salesStageTransitions: {
      awareness: 25,
      interest: 18,
      consideration: 12,
      intent: 10,
      evaluation: 8,
      purchase: 5
    },
    productsMentioned: {
      "1": 7,
      "2": 5,
      "3": 3
    }
  });
});

export default router;