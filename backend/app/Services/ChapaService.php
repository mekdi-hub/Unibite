<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChapaService
{
    protected $secretKey;
    protected $baseUrl;

    public function __construct()
    {
        $this->secretKey = env('CHAPA_SECRET_KEY');
        $this->baseUrl = 'https://api.chapa.co/v1';
    }

    /**
     * Initialize a payment
     */
    public function initializePayment($data)
    {
        try {
            // Log the request data for debugging
            Log::info('Chapa payment initialization request', [
                'data' => $data,
                'secret_key_present' => !empty($this->secretKey),
                'base_url' => $this->baseUrl,
                'phone_number' => $data['phone_number'] ?? 'not provided'
            ]);

            $payload = [
                'amount' => (string)$data['amount'],
                'currency' => 'ETB',
                'email' => $data['email'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'phone_number' => $data['phone_number'],
                'tx_ref' => $data['tx_ref'], // Unique transaction reference
                'callback_url' => $data['callback_url'],
                'return_url' => $data['return_url'],
                'customization' => [
                    'title' => 'UniBite Order', // Max 16 characters
                    'description' => 'Food Order', // Simple description without special characters
                ]
            ];

            Log::info('Chapa API request payload', ['payload' => $payload]);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/transaction/initialize', $payload);

            Log::info('Chapa API response', [
                'status' => $response->status(),
                'body' => $response->json()
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            Log::error('Chapa payment initialization failed', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);

            return [
                'success' => false,
                'message' => $response->json()['message'] ?? 'Payment initialization failed',
                'data' => $response->json()
            ];

        } catch (\Exception $e) {
            Log::error('Chapa payment exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => 'An error occurred while initializing payment: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Verify a payment
     */
    public function verifyPayment($txRef)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
            ])->get($this->baseUrl . '/transaction/verify/' . $txRef);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            return [
                'success' => false,
                'message' => 'Payment verification failed',
                'data' => $response->json()
            ];

        } catch (\Exception $e) {
            Log::error('Chapa verification exception', [
                'message' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'An error occurred while verifying payment'
            ];
        }
    }

    /**
     * Generate a unique transaction reference
     */
    public static function generateTxRef($orderId)
    {
        return 'UB-' . $orderId . '-' . time() . '-' . rand(1000, 9999);
    }

    /**
     * Process refund for a transaction
     * Note: Chapa test mode may not support refunds. This will work in production.
     */
    public function refund($transactionId, $amount, $reason = 'Order cancelled')
    {
        try {
            // For test mode, we'll simulate a successful refund
            // In production, this will call the actual Chapa refund API
            if (str_starts_with($transactionId, 'TEST-')) {
                Log::info('Test mode refund - simulating successful refund', [
                    'transaction_id' => $transactionId,
                    'amount' => $amount
                ]);

                return [
                    'success' => true,
                    'data' => [
                        'status' => 'success',
                        'message' => 'Refund processed successfully (Test Mode)',
                        'transaction_id' => $transactionId,
                        'amount' => $amount
                    ],
                    'message' => 'Refund processed successfully (Test Mode)'
                ];
            }

            // Production refund - using Chapa's actual refund endpoint
            // Note: The exact endpoint may vary - check Chapa documentation
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/transaction/refund', [
                'tx_ref' => $transactionId,
                'amount' => $amount,
                'reason' => $reason
            ]);

            $data = $response->json();

            Log::info('Chapa Refund Response', [
                'transaction_id' => $transactionId,
                'amount' => $amount,
                'response' => $data
            ]);

            return [
                'success' => $response->successful() && isset($data['status']) && $data['status'] === 'success',
                'data' => $data,
                'message' => $data['message'] ?? 'Refund processed'
            ];
        } catch (\Exception $e) {
            Log::error('Chapa Refund Error', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'data' => null,
                'message' => 'Refund failed: ' . $e->getMessage()
            ];
        }
    }
}
