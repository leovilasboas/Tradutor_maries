'use client';

import { useState, useEffect } from 'react';

export default function DiagnosticPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('translation');

  const runTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/test');
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  if (error) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ 
          backgroundColor: '#fee2e2', 
          border: '1px solid #ef4444', 
          borderRadius: '0.5rem', 
          padding: '1rem', 
          marginBottom: '1.5rem' 
        }}>
          <h3 style={{ color: '#b91c1c', fontWeight: 'bold', marginBottom: '0.5rem' }}>Erro</h3>
          <p>{error}</p>
        </div>
        <button 
          onClick={runTests} 
          disabled={loading}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Tentando novamente...' : 'Tentar novamente'}
        </button>
      </div>
    );
  }

  if (loading || !results) {
    return (
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh'
      }}>
        <div style={{ 
          borderTop: '4px solid #3b82f6',
          borderRight: '4px solid transparent',
          borderBottom: '4px solid transparent',
          borderLeft: '4px solid transparent',
          borderRadius: '50%',
          width: '3rem',
          height: '3rem',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Executando testes de diagnóstico...</h2>
        <p style={{ color: '#6b7280' }}>Isso pode levar alguns segundos.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Diagnóstico do Tradutor de Mariês</h1>
          <p style={{ color: '#6b7280' }}>Verificando se a IA está funcionando corretamente</p>
        </div>
        <button 
          onClick={runTests} 
          disabled={loading}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Executando...' : 'Executar novamente'}
        </button>
      </div>

      <div style={{ 
        border: '1px solid #e5e7eb', 
        borderRadius: '0.5rem', 
        marginBottom: '2rem',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Resultado Geral</h2>
            <span style={{ 
              backgroundColor: parseInt(results.overallSuccess) > 75 ? '#10b981' : '#ef4444', 
              color: 'white', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}>
              {results.overallSuccess} de sucesso
            </span>
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Última execução: {new Date(results.timestamp).toLocaleString()}
          </p>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1rem' 
          }}>
            <div style={{ 
              border: '1px solid #e5e7eb', 
              borderRadius: '0.5rem', 
              padding: '1rem' 
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '0.5rem' 
              }}>
                <h3 style={{ fontWeight: 'bold' }}>Tradução</h3>
                <span style={{ 
                  backgroundColor: parseInt(results.translation.success) > 75 ? '#10b981' : '#ef4444', 
                  color: 'white', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  {results.translation.success}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {results.translation.passed} de {results.translation.total} testes passaram
              </p>
            </div>
            <div style={{ 
              border: '1px solid #e5e7eb', 
              borderRadius: '0.5rem', 
              padding: '1rem' 
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '0.5rem' 
              }}>
                <h3 style={{ fontWeight: 'bold' }}>Análise</h3>
                <span style={{ 
                  backgroundColor: parseInt(results.analysis.success) > 75 ? '#10b981' : '#ef4444', 
                  color: 'white', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  {results.analysis.success}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {results.analysis.passed} de {results.analysis.total} testes passaram
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '1rem' }}>
          <button 
            onClick={() => setActiveTab('translation')}
            style={{
              padding: '0.5rem 1rem',
              fontWeight: activeTab === 'translation' ? 'bold' : 'normal',
              borderBottom: activeTab === 'translation' ? '2px solid #3b82f6' : 'none',
              marginRight: '1rem',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
          >
            Testes de Tradução
          </button>
          <button 
            onClick={() => setActiveTab('analysis')}
            style={{
              padding: '0.5rem 1rem',
              fontWeight: activeTab === 'analysis' ? 'bold' : 'normal',
              borderBottom: activeTab === 'analysis' ? '2px solid #3b82f6' : 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
          >
            Testes de Análise
          </button>
        </div>
        
        {activeTab === 'translation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {results.translation.results.map((result: any, index: number) => (
              <div key={index} style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.5rem', 
                overflow: 'hidden' 
              }}>
                <div style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ fontWeight: 'bold' }}>Teste #{index + 1}</h3>
                  <span style={{ 
                    backgroundColor: result.passed ? '#10b981' : '#ef4444', 
                    color: 'white', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}>
                    {result.passed ? 'Passou' : 'Falhou'}
                  </span>
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Texto em Mariês:</h4>
                    <div style={{ 
                      backgroundColor: '#f3f4f6', 
                      padding: '0.75rem', 
                      borderRadius: '0.375rem' 
                    }}>
                      {result.input}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Tradução Esperada:</h4>
                    <div style={{ 
                      backgroundColor: '#f3f4f6', 
                      padding: '0.75rem', 
                      borderRadius: '0.375rem' 
                    }}>
                      {result.expectedOutput}
                    </div>
                  </div>
                  
                  <div>
                    <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Tradução Atual:</h4>
                    <div style={{ 
                      backgroundColor: '#f3f4f6', 
                      padding: '0.75rem', 
                      borderRadius: '0.375rem' 
                    }}>
                      {result.actualOutput}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'analysis' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {results.analysis.results.map((result: any, index: number) => (
              <div key={index} style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.5rem', 
                overflow: 'hidden' 
              }}>
                <div style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ fontWeight: 'bold' }}>Teste #{index + 1}</h3>
                  <span style={{ 
                    backgroundColor: result.passed ? '#10b981' : '#ef4444', 
                    color: 'white', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}>
                    {result.passed ? 'Passou' : 'Falhou'}
                  </span>
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Texto:</h4>
                    <div style={{ 
                      backgroundColor: '#f3f4f6', 
                      padding: '0.75rem', 
                      borderRadius: '0.375rem' 
                    }}>
                      {result.input}
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '1rem' 
                  }}>
                    <div style={{ 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '0.5rem', 
                      padding: '0.75rem' 
                    }}>
                      <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Nível Esperado:</h4>
                      <span style={{ 
                        backgroundColor: '#3b82f6', 
                        color: 'white', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}>
                        {result.expectedLevel}
                      </span>
                    </div>
                    
                    <div style={{ 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '0.5rem', 
                      padding: '0.75rem' 
                    }}>
                      <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Nível Atual:</h4>
                      <span style={{ 
                        backgroundColor: result.passed ? '#3b82f6' : '#ef4444', 
                        color: 'white', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}>
                        {result.actualLevel}
                      </span>
                    </div>
                    
                    <div style={{ 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '0.5rem', 
                      padding: '0.75rem' 
                    }}>
                      <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Pontuação:</h4>
                      <span style={{ fontWeight: 'bold' }}>{result.difficultyScore}/100</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
