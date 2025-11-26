import React, { useState, useEffect } from 'react';
import { Subject, Grade, GeneratedTask, PaymentState, EducationLevel, EDUCATION_STRUCTURE } from './types';
import { generateSchoolTask } from './services/geminiService';
import { canGenerateTask, recordGeneration, getPaymentState, activatePremium, getPixKey } from './services/paymentService';
import { Worksheet } from './components/Worksheet';

const App: React.FC = () => {
  // State
  const [educationLevel, setEducationLevel] = useState<EducationLevel>(EducationLevel.FUNDAMENTAL);
  const [subject, setSubject] = useState<Subject>(Subject.PORTUGUESE);
  const [grade, setGrade] = useState<Grade>(EDUCATION_STRUCTURE[EducationLevel.FUNDAMENTAL][0]);
  const [topic, setTopic] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState<GeneratedTask | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>(getPaymentState());
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Receipt Upload State
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setPaymentState(getPaymentState());
  }, []);

  // Update grade when level changes to default to the first grade of that level
  useEffect(() => {
    setGrade(EDUCATION_STRUCTURE[educationLevel][0]);
  }, [educationLevel]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canGenerateTask()) {
      setShowPaymentModal(true);
      return;
    }

    if (!topic.trim()) {
      setError("Por favor, digite um tópico para a atividade.");
      return;
    }

    setLoading(true);
    try {
      const result = await generateSchoolTask(subject, educationLevel, grade, topic);
      setTask(result);
      recordGeneration();
      setPaymentState(getPaymentState()); // Update state to reflect usage
    } catch (err: any) {
      setError(err.message || "Erro ao gerar tarefa.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const element = document.getElementById('printable-area');
    if (!element) return;

    const opt = {
      margin:       0,
      filename:     `EduTask-${subject.replace(/\s+/g, '-')}-${grade.replace(/\s+/g, '-')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    if (window.html2pdf) {
      // @ts-ignore
      window.html2pdf().set(opt).from(element).save();
    } else {
      alert("Erro: Biblioteca PDF não carregada. Tente recarregar a página.");
    }
  };

  const handleSendReceipt = async () => {
    if (!receiptFile) {
      alert("Por favor, anexe o arquivo do comprovante.");
      return;
    }

    setIsSending(true);

    // Simulação de envio seguro para o email maxoliveiraf@gmail.com
    // Como não temos backend, simulamos o delay de upload e envio de email
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      activatePremium();
      setPaymentState(getPaymentState());
      setShowPaymentModal(false);
      setReceiptFile(null);
      alert("Comprovante enviado com sucesso! Acesso ilimitado liberado por 30 dias.");
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar o comprovante. Tente novamente.");
    } finally {
      setIsSending(false);
    }
  };

  const copyPix = () => {
    navigator.clipboard.writeText(getPixKey());
    alert("Chave PIX copiada!");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      
      {/* Navbar - Hidden on Print */}
      <nav className="bg-blue-600 text-white p-4 shadow-md no-print">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
             <h1 className="text-2xl font-bold">EduTask</h1>
          </div>
          <div className="flex gap-4 text-sm items-center">
             {paymentState.isPremium ? (
               <span className="bg-green-500 px-3 py-1 rounded-full font-bold">Premium Ativo</span>
             ) : (
               <button onClick={() => setShowPaymentModal(true)} className="bg-yellow-400 text-blue-900 px-3 py-1 rounded-full font-bold hover:bg-yellow-300 transition">
                 Seja Premium (R$ 1,00)
               </button>
             )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col md:flex-row max-w-6xl mx-auto w-full p-4 gap-6">
        
        {/* Left Sidebar: Controls & Premium Card (Hidden on Print) */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-6 no-print">
          
          {/* Config Card */}
          <aside className="bg-white p-6 rounded-xl shadow-lg h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Configurar Tarefa</h2>
            
            <form onSubmit={handleGenerate} className="flex flex-col gap-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Ensino</label>
                <select 
                  value={educationLevel} 
                  onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {Object.values(EducationLevel).map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano Escolar</label>
                <select 
                  value={grade} 
                  onChange={(e) => setGrade(e.target.value as Grade)}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {EDUCATION_STRUCTURE[educationLevel].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina</label>
                <select 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value as Subject)}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tópico / Tema</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex: Frações, Cores, Revolução..."
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold text-white transition shadow-md 
                  ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {loading ? 'Gerando...' : 'Gerar Tarefa'}
              </button>

              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            </form>

            <div className="mt-6 pt-4 border-t text-sm text-gray-500">
              <p>Limite: 1 tarefa grátis/dia.</p>
            </div>
          </aside>

          {/* Premium Card Sidebar - Visible if not premium */}
          {!paymentState.isPremium && (
            <aside className="bg-white p-6 rounded-xl shadow-lg h-fit border border-yellow-200 relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-yellow-400 text-blue-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg shadow-sm">
                 PREMIUM
               </div>
               <div className="flex flex-col items-center">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Seja Premium</h3>
                  
                  {/* QR Code */}
                  <div className="bg-white p-2 border rounded-lg mb-4 shadow-inner">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(getPixKey())}`} 
                      alt="QR Code PIX" 
                      className="w-32 h-32"
                     />
                  </div>

                  {/* PIX Key Copy */}
                  <div className="w-full mb-4">
                     <div className="flex gap-2">
                       <input 
                        readOnly 
                        value={getPixKey()} 
                        className="text-xs bg-gray-50 border p-2 rounded-l-lg w-full truncate text-gray-500 outline-none"
                       />
                       <button onClick={copyPix} className="bg-blue-100 text-blue-700 px-3 rounded-r-lg font-bold text-xs hover:bg-blue-200 border-t border-b border-r border-blue-100">
                         Copiar
                       </button>
                     </div>
                  </div>

                  {/* Upload Receipt */}
                  <div className="w-full mb-4">
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Envie o comprovante:
                    </label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50 hover:bg-white transition-colors text-center cursor-pointer group">
                       <input 
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={(e) => setReceiptFile(e.target.files ? e.target.files[0] : null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {receiptFile ? (
                         <div className="flex items-center justify-center gap-2 text-green-600 font-medium text-xs break-all">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            <span className="truncate">{receiptFile.name}</span>
                         </div>
                      ) : (
                         <div className="flex flex-col items-center gap-1 text-gray-500 group-hover:text-gray-700">
                            <span className="text-xs">Clique para anexar</span>
                         </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    onClick={handleSendReceipt}
                    disabled={!receiptFile || isSending}
                    className={`w-full py-2 rounded-lg font-bold text-white text-sm transition flex justify-center items-center gap-2 mb-4
                      ${!receiptFile || isSending ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-md'}`}
                  >
                    {isSending ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                      </>
                    ) : 'Enviar Comprovante'}
                  </button>

                  {/* Footer Message */}
                  <div className="bg-yellow-50 p-2 rounded text-center border border-yellow-100 w-full">
                    <p className="text-xs text-gray-700 font-semibold leading-tight">
                      Ajude com R$1,00 Real para gerar atividades sem limites por 30 dias
                    </p>
                  </div>
               </div>
            </aside>
          )}

        </div>

        {/* Right Area: Preview */}
        <section className="w-full md:w-2/3 lg:w-3/4 flex flex-col items-center">
          {task ? (
            <div className="w-full">
              <div className="flex justify-between items-center mb-4 no-print">
                <h2 className="text-xl font-bold text-gray-800">Pré-visualização</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setTask(null)} 
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 underline"
                  >
                    Limpar
                  </button>
                  <button 
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 shadow"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Baixar PDF
                  </button>
                </div>
              </div>
              
              {/* Worksheet Component */}
              <div id="printable-area" className="border shadow-2xl print:border-none print:shadow-none bg-white">
                 <Worksheet task={task} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 min-h-[400px] bg-white w-full rounded-xl border-2 border-dashed no-print">
               <svg className="w-24 h-24 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
               <p className="text-lg font-medium">Configure os dados ao lado e clique em gerar.</p>
            </div>
          )}
        </section>
      </main>

      {/* Payment Modal (Triggered by Generate Button if limit reached) */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="bg-blue-600 p-4 text-white text-center">
              <h3 className="text-xl font-bold">Acesso Ilimitado por 30 dias</h3>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <p className="text-gray-600 text-center text-sm">
                Você atingiu o limite gratuito. Desbloqueie gerações ilimitadas por 30 dias por apenas <strong>R$ 1,00</strong>.
              </p>
              
              <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                 <div className="flex justify-center mb-2">
                   <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(getPixKey())}`} 
                    alt="QR Code PIX" 
                    className="border-4 border-white rounded shadow-sm w-32 h-32"
                   />
                 </div>
                 <p className="text-[10px] text-center text-gray-500 mb-2 uppercase font-semibold">Escaneie ou Copie a chave PIX</p>
                 <div className="flex gap-2">
                   <input 
                    readOnly 
                    value={getPixKey()} 
                    className="text-xs bg-white border p-2 rounded w-full truncate text-gray-500 outline-none"
                   />
                   <button onClick={copyPix} className="bg-blue-100 text-blue-700 px-3 rounded font-bold text-xs hover:bg-blue-200">
                     Copiar
                   </button>
                 </div>
              </div>

              {/* Receipt Upload Section in Modal */}
              <div className="mt-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Envie o comprovante para liberar:
                </label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-white transition-colors text-center">
                   <input 
                    type="file" 
                    accept="image/*,.pdf"
                    onChange={(e) => setReceiptFile(e.target.files ? e.target.files[0] : null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {receiptFile ? (
                     <div className="flex items-center justify-center gap-2 text-green-600 font-medium text-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        {receiptFile.name}
                     </div>
                  ) : (
                     <div className="flex flex-col items-center gap-1 text-gray-500">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        <span className="text-xs">Clique para anexar (JPG, PNG ou PDF)</span>
                     </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <button 
                  onClick={handleSendReceipt}
                  disabled={!receiptFile || isSending}
                  className={`w-full py-3 rounded-lg font-bold text-white transition flex justify-center items-center gap-2
                    ${!receiptFile || isSending ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </>
                  ) : 'Enviar Comprovante'}
                </button>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isSending}
                  className="w-full py-2 text-gray-500 hover:text-gray-700 font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;