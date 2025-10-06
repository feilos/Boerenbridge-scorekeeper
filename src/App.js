import React, { useState } from 'react';
import { Plus, Trash2, Minus } from 'lucide-react';

export default function BoerenBridgeScore() {
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [rounds, setRounds] = useState([]);
  const [currentRound, setCurrentRound] = useState(null);
  const [bids, setBids] = useState({});
  const [results, setResults] = useState({});

  const addPlayer = () => {
    if (newPlayerName.trim() && !gameStarted) {
      setPlayers([...players, { id: Date.now(), name: newPlayerName.trim(), score: 0 }]);
      setNewPlayerName('');
    }
  };

  const removePlayer = (id) => {
    if (!gameStarted) {
      setPlayers(players.filter(p => p.id !== id));
    }
  };

  const startGame = () => {
    if (players.length >= 2) {
      setGameStarted(true);
      startNewRound();
    }
  };

  const startNewRound = () => {
    const roundNumber = rounds.length + 1;
    setCurrentRound(roundNumber);
    const initialBids = {};
    const initialResults = {};
    players.forEach(p => {
      initialBids[p.id] = 0;
      initialResults[p.id] = { achieved: true, actualTricks: 0 };
    });
    setBids(initialBids);
    setResults(initialResults);
  };

  const changeBid = (playerId, delta) => {
    setBids(prevBids => {
      const current = prevBids[playerId] || 0;
      const newValue = Math.max(0, current + delta);
      return { ...prevBids, [playerId]: newValue };
    });
  };

  const changeActual = (playerId, delta) => {
    setResults(prevResults => {
      const current = prevResults[playerId]?.actualTricks || 0;
      const newValue = Math.max(0, current + delta);
      const bid = bids[playerId] || 0;
      const achieved = newValue === bid;
      return { ...prevResults, [playerId]: { achieved, actualTricks: newValue } };
    });
  };

  const finishRound = () => {
    const roundData = {
      number: currentRound,
      data: players.map(p => {
        const bid = bids[p.id] || 0;
        const actualTricks = results[p.id]?.actualTricks || 0;
        const achieved = bid === actualTricks;
        const difference = Math.abs(bid - actualTricks);
        const points = achieved ? 10 + (3 * bid) : -(3 * difference);

        return {
          playerId: p.id,
          playerName: p.name,
          bid: bid,
          actualTricks: actualTricks,
          achieved: achieved,
          points: points
        };
      })
    };

    setRounds([...rounds, roundData]);

    const updatedPlayers = players.map(p => {
      const playerRound = roundData.data.find(d => d.playerId === p.id);
      return { ...p, score: p.score + playerRound.points };
    });
    setPlayers(updatedPlayers);

    setCurrentRound(null);
    setBids({});
    setResults({});
  };

  const resetGame = () => {
    if (window.confirm('Weet je zeker dat je het spel wilt resetten?')) {
      setGameStarted(false);
      setRounds([]);
      setCurrentRound(null);
      setBids({});
      setResults({});
      setPlayers(players.map(p => ({ ...p, score: 0 })));
    }
  };

  const getTotalBids = () => {
    return Object.values(bids).reduce((sum, bid) => sum + (bid || 0), 0);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen p-2 sm:p-4" style={{
        background: 'linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #CD853F 100%)'
      }}>
        <div className="max-w-md mx-auto bg-amber-50 rounded-xl shadow-2xl p-4 sm:p-6" style={{
          borderColor: '#654321',
          borderStyle: 'double',
          borderWidth: '6px'
        }}>
          <div className="text-center mb-4">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2" style={{
              color: '#654321',
              fontFamily: 'Georgia, serif',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>🂡 Boerenbridge 🂱</h1>
            <div className="text-xs sm:text-sm" style={{color: '#8B4513'}}>♠ ♥ ♣ ♦</div>
          </div>

          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-bold mb-2" style={{color: '#654321', fontFamily: 'Georgia, serif'}}>Spelers toevoegen</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                placeholder="Naam van speler"
                className="flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-4 text-base"
                style={{
                  border: '3px solid #8B4513',
                  backgroundColor: '#FFF8DC',
                  color: '#654321'
                }}
              />
              <button
                onClick={addPlayer}
                className="px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                style={{
                  backgroundColor: '#8B4513',
                  color: '#FFF8DC',
                  border: '2px solid #654321'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#654321'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#8B4513'}
              >
                <Plus size={20} />
                Toevoegen
              </button>
            </div>
          </div>

          {players.length > 0 && (
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-bold mb-2" style={{color: '#654321'}}>Spelers ({players.length})</h3>
              <div className="space-y-2">
                {players.map(player => (
                  <div key={player.id} className="flex justify-between items-center p-2 sm:p-3 rounded-lg" style={{
                    backgroundColor: '#F5DEB3',
                    border: '2px solid #D2691E'
                  }}>
                    <span className="font-bold text-sm sm:text-base" style={{color: '#654321'}}>{player.name}</span>
                    <button
                      onClick={() => removePlayer(player.id)}
                      style={{color: '#8B0000'}}
                      className="hover:opacity-70"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {players.length >= 2 && (
            <button
              onClick={startGame}
              className="w-full py-3 rounded-lg font-bold text-lg sm:text-xl transition-all"
              style={{
                backgroundColor: '#8B4513',
                color: '#FFF8DC',
                border: '3px solid #654321'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#654321'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#8B4513'}
            >
              🎴 Start Spel 🎴
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4" style={{
      background: 'linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #CD853F 100%)'
    }}>
      <div className="max-w-md sm:max-w-4xl mx-auto">
        <div className="bg-amber-50 rounded-xl shadow-2xl p-3 sm:p-6 mb-3 sm:mb-4" style={{
          borderColor: '#654321',
          borderStyle: 'double',
          borderWidth: '6px'
        }}>
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-xl sm:text-3xl font-bold" style={{
              color: '#654321',
              fontFamily: 'Georgia, serif',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>🂡 Boerenbridge 🂱</h1>
            <button
              onClick={resetGame}
              className="px-2 py-1 sm:px-4 sm:py-2 rounded-lg font-bold text-xs sm:text-base transition-all"
              style={{
                backgroundColor: '#8B0000',
                color: '#FFF8DC',
                border: '2px solid #654321'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#650000'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#8B0000'}
            >
              Reset
            </button>
          </div>

          {rounds.length > 0 && (
            <div className="rounded-lg p-3 mb-3" style={{
              backgroundColor: '#F4A460',
              border: '3px solid #8B4513'
            }}>
              <h3 className="font-bold text-base sm:text-lg mb-2" style={{color: '#654321', fontFamily: 'Georgia, serif'}}>🏆 Tussenstand</h3>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <div className="text-xs sm:text-sm font-bold mb-1" style={{color: '#654321'}}>Biedpan (minste biedingen):</div>
                  <div className="font-bold text-sm sm:text-lg" style={{color: '#8B0000'}}>
                    {(() => {
                      const playersWithBids = players.map(p => ({
                        name: p.name,
                        score: p.score,
                        totalBids: rounds.reduce((sum, round) => {
                          const data = round.data.find(d => d.playerId === p.id);
                          return sum + (data?.bid || 0);
                        }, 0)
                      }));
                      
                      playersWithBids.sort((a, b) => {
                        if (a.totalBids !== b.totalBids) return a.totalBids - b.totalBids;
                        if (a.score !== b.score) return a.score - b.score;
                        return a.name.localeCompare(b.name);
                      });
                      
                      return playersWithBids[0].name;
                    })()}
                  </div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold mb-1" style={{color: '#654321'}}>Puntenpan (minste punten):</div>
                  <div className="font-bold text-sm sm:text-lg" style={{color: '#8B0000'}}>
                    {(() => {
                      const playersWithBids = players.map(p => ({
                        name: p.name,
                        score: p.score,
                        totalBids: rounds.reduce((sum, round) => {
                          const data = round.data.find(d => d.playerId === p.id);
                          return sum + (data?.bid || 0);
                        }, 0)
                      }));
                      
                      playersWithBids.sort((a, b) => {
                        if (a.score !== b.score) return a.score - b.score;
                        if (a.totalBids !== b.totalBids) return a.totalBids - b.totalBids;
                        return a.name.localeCompare(b.name);
                      });
                      
                      return playersWithBids[0].name;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {currentRound && (
          <div className="bg-amber-50 rounded-xl shadow-2xl p-3 sm:p-4 mb-3 sm:mb-4" style={{
            borderColor: '#654321',
            borderStyle: 'double',
            borderWidth: '6px'
          }}>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg sm:text-xl font-bold" style={{color: '#654321', fontFamily: 'Georgia, serif'}}>Ronde {currentRound}</h2>
              <div className="rounded-lg px-2 py-1" style={{
                backgroundColor: '#F4A460',
                border: '2px solid #8B4513'
              }}>
                <span className="text-xs font-bold" style={{color: '#654321'}}>Totaal: </span>
                <span className="text-base sm:text-lg font-bold" style={{color: '#8B0000'}}>{getTotalBids()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {players.map((player) => (
                <div key={player.id} className="rounded-lg p-2" style={{
                  border: '2px solid #8B4513',
                  backgroundColor: '#F5DEB3'
                }}>
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-sm flex-shrink-0" style={{color: '#654321', width: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{player.name}</div>
                    
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div className="rounded p-1" style={{
                        backgroundColor: '#FFF8DC',
                        border: '1px solid #D2691E'
                      }}>
                        <div className="text-xs font-bold text-center mb-0.5" style={{color: '#8B4513'}}>Bieding</div>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => changeBid(player.id, -1)}
                            className="w-7 h-7 rounded font-bold text-lg flex items-center justify-center transition-all touch-manipulation"
                            style={{
                              backgroundColor: '#8B0000',
                              color: '#FFF8DC',
                              border: '1px solid #654321'
                            }}
                          >
                            −
                          </button>
                          <div className="text-2xl font-bold w-8 text-center" style={{color: '#654321'}}>{bids[player.id] || 0}</div>
                          <button
                            type="button"
                            onClick={() => changeBid(player.id, 1)}
                            className="w-7 h-7 rounded font-bold text-lg flex items-center justify-center transition-all touch-manipulation"
                            style={{
                              backgroundColor: '#228B22',
                              color: '#FFF8DC',
                              border: '1px solid #654321'
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div className="rounded p-1" style={{
                        backgroundColor: '#FFF8DC',
                        border: '1px solid #D2691E'
                      }}>
                        <div className="text-xs font-bold text-center mb-0.5" style={{color: '#8B4513'}}>Behaald</div>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => changeActual(player.id, -1)}
                            className="w-7 h-7 rounded font-bold text-lg flex items-center justify-center transition-all touch-manipulation"
                            style={{
                              backgroundColor: '#8B0000',
                              color: '#FFF8DC',
                              border: '1px solid #654321'
                            }}
                          >
                            −
                          </button>
                          <div className="text-2xl font-bold w-8 text-center" style={{color: '#654321'}}>{results[player.id]?.actualTricks || 0}</div>
                          <button
                            type="button"
                            onClick={() => changeActual(player.id, 1)}
                            className="w-7 h-7 rounded font-bold text-lg flex items-center justify-center transition-all touch-manipulation"
                            style={{
                              backgroundColor: '#228B22',
                              color: '#FFF8DC',
                              border: '1px solid #654321'
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {(() => {
                      const bid = bids[player.id] || 0;
                      const actual = results[player.id]?.actualTricks || 0;
                      const achieved = bid === actual;
                      return (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={{
                          backgroundColor: achieved ? '#228B22' : '#8B0000',
                          color: '#FFF8DC'
                        }}>
                          {achieved ? '✓' : '✗'}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={finishRound}
              className="w-full mt-3 py-3 rounded-lg font-bold text-lg transition-all"
              style={{
                backgroundColor: '#8B4513',
                color: '#FFF8DC',
                border: '3px solid #654321'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#654321'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#8B4513'}
            >
              Ronde Afronden
            </button>
          </div>
        )}

        {!currentRound && rounds.length > 0 && (
          <div className="bg-amber-50 rounded-xl shadow-2xl p-4 mb-4" style={{
            borderColor: '#228B22',
            borderStyle: 'double',
            borderWidth: '8px',
            background: 'linear-gradient(135deg, #90EE90 0%, #98FB98 100%)'
          }}>
            <button
              onClick={startNewRound}
              className="w-full py-4 rounded-lg font-bold text-xl transition-all"
              style={{
                backgroundColor: '#228B22',
                color: '#FFF8DC',
                border: '4px solid #654321',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = '#006400';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = '#228B22';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              🎴 NIEUWE RONDE STARTEN 🎴
            </button>
          </div>
        )}

        {rounds.length > 0 && (
          <>
            <div className="bg-amber-50 rounded-xl shadow-2xl p-6 mb-4" style={{
              borderColor: '#654321',
              borderStyle: 'double',
              borderWidth: '8px'
            }}>
              <h2 className="text-2xl font-bold mb-4" style={{
                color: '#654321',
                fontFamily: 'Georgia, serif'
              }}>📜 Rondeoverzicht</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{borderBottom: '3px solid #8B4513'}}>
                      <th className="text-left py-2 px-2 font-bold" style={{color: '#654321'}}>Ronde</th>
                      {players.map(p => (
                        <th key={p.id} className="text-center py-2 px-2 font-bold" style={{color: '#654321'}}>{p.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rounds.map(round => (
                      <tr key={round.number} style={{borderBottom: '1px solid #D2691E'}}>
                        <td className="py-2 px-2 font-bold" style={{color: '#654321'}}>{round.number}</td>
                        {players.map(p => {
                          const data = round.data.find(d => d.playerId === p.id);
                          return (
                            <td key={p.id} className="text-center py-2 px-2">
                              <div className="text-sm">
                                <div className="font-bold" style={{color: '#654321'}}>Bod: {data.bid}</div>
                                <div className="text-xs" style={{color: '#8B4513'}}>Behaald: {data.actualTricks}</div>
                                <div className="font-bold" style={{
                                  color: data.achieved ? '#228B22' : '#8B0000'
                                }}>
                                  {data.achieved ? '✓' : '✗'} {data.points > 0 ? '+' : ''}{data.points}pt
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl shadow-2xl p-6 mb-4" style={{
              borderColor: '#654321',
              borderStyle: 'double',
              borderWidth: '8px'
            }}>
              <h2 className="text-2xl font-bold mb-4" style={{
                color: '#654321',
                fontFamily: 'Georgia, serif'
              }}>📊 Eindstand - Punten</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(() => {
                  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
                  return sortedPlayers.map((player, index) => {
                    const totalBids = rounds.reduce((sum, round) => {
                      const data = round.data.find(d => d.playerId === player.id);
                      return sum + (data?.bid || 0);
                    }, 0);
                    
                    return (
                      <div key={player.id} className="rounded-lg p-4 shadow-lg" style={{
                        backgroundColor: '#F4A460',
                        border: '3px solid #8B4513'
                      }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold" style={{color: '#654321'}}>#{index + 1}</span>
                          {index === 0 && <span className="text-2xl">🥇</span>}
                          {index === 1 && <span className="text-2xl">🥈</span>}
                          {index === 2 && <span className="text-2xl">🥉</span>}
                        </div>
                        <div className="font-bold text-xl mb-1" style={{color: '#654321'}}>{player.name}</div>
                        <div className="text-3xl font-bold mb-2" style={{color: '#8B0000'}}>{player.score} pt</div>
                        <div className="text-sm" style={{color: '#654321'}}>
                          Totaal geboden: <span className="font-bold">{totalBids}</span> slagen
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl shadow-2xl p-6 mb-4" style={{
              borderColor: '#654321',
              borderStyle: 'double',
              borderWidth: '8px'
            }}>
              <h2 className="text-2xl font-bold mb-4" style={{
                color: '#654321',
                fontFamily: 'Georgia, serif'
              }}>🎯 Eindstand - Biedingen</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(() => {
                  const playersWithBids = players.map(player => {
                    const totalBids = rounds.reduce((sum, round) => {
                      const data = round.data.find(d => d.playerId === player.id);
                      return sum + (data?.bid || 0);
                    }, 0);
                    return { ...player, totalBids };
                  });
                  const sortedByBids = [...playersWithBids].sort((a, b) => b.totalBids - a.totalBids);

                  return sortedByBids.map((player, index) => (
                    <div key={player.id} className="rounded-lg p-4 shadow-lg" style={{
                      backgroundColor: '#F4A460',
                      border: '3px solid #8B4513'
                    }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold" style={{color: '#654321'}}>#{index + 1}</span>
                        {index === 0 && <span className="text-2xl">🎯</span>}
                      </div>
                      <div className="font-bold text-xl mb-1" style={{color: '#654321'}}>{player.name}</div>
                      <div className="text-3xl font-bold mb-2" style={{color: '#8B0000'}}>{player.totalBids}</div>
                      <div className="text-sm" style={{color: '#654321'}}>
                        slagen geboden
                      </div>
                      <div className="text-xs mt-1" style={{color: '#8B4513'}}>
                        Score: {player.score} punten
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
