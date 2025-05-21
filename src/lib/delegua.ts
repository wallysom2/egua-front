import { Lexador, AvaliadorSintatico, InterpretadorComDepuracao } from '@designliquido/delegua';

export async function executarCodigo(codigo: string): Promise<string[]> {
  const saida: string[] = [];
  
  try {
    if (!codigo || codigo.trim() === '') {
      return ['Por favor, insira algum código para executar.'];
    }

    const lexador = new Lexador();
    const avaliadorSintatico = new AvaliadorSintatico();
    
    const interpretador = new InterpretadorComDepuracao(
      process.cwd(), 
      (saidaChamada: any) => { 
        saida.push(String(saidaChamada));
      },
      (saidaChamada: any) => { 
        if (saida.length > 0 && !saida[saida.length - 1].endsWith('\n')) {
            saida[saida.length - 1] += String(saidaChamada);
        } else {
            saida.push(String(saidaChamada));
        }
      }
    );

    interpretador.interfaceEntradaSaida = {
      question: async (mensagem: string) => {
        console.log(`Pergunta do sistema: ${mensagem}`);
        return Promise.resolve('');
      },
      write: (texto: string) => {
        saida.push(texto);
      }
    };

    // Dividir o código em linhas e remover linhas vazias
    const linhasDoCodigo = codigo
      .split('\n')
      .map(linha => linha.trim())
      .filter(linha => linha !== '');

    if (linhasDoCodigo.length === 0) {
      return ['Por favor, insira algum código para executar.'];
    }

    const resultadoLexador = lexador.mapear(linhasDoCodigo);
    
    if (resultadoLexador.erros.length > 0) {
      return resultadoLexador.erros.map(erro => 
        `Erro léxico na linha ${erro.linha}: ${erro.mensagem}`
      );
    }

    const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
    
    if (resultadoAvaliadorSintatico.erros.length > 0) {
      return resultadoAvaliadorSintatico.erros.map(erro => 
        `Erro sintático na linha ${erro.linha}: ${erro.mensagem}`
      );
    }

    const retornoInterpretador = await interpretador.interpretar(
      resultadoAvaliadorSintatico.declaracoes,
      false
    );

    if (retornoInterpretador.erros && retornoInterpretador.erros.length > 0) {
      return retornoInterpretador.erros.map(erro => 
        `Erro de execução: ${erro.mensagem}`
      );
    }

    return saida.length > 0 ? saida : ['Código executado com sucesso!'];
    
  } catch (erro: any) {
    console.error("Erro na execução:", erro);
    return [`Erro na execução: ${erro.message || 'Erro desconhecido'}`];
  }
} 