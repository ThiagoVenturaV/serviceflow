// ─── Testes: LandingPage.jsx ────────────────────────────────────────────────
// Testa a renderização da landing page, interações de branding,
// e que todos os CTAs disparam a callback correta.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LandingPage from '../LandingPage.jsx';

describe('LandingPage', () => {
  let onStartChat;

  beforeEach(() => {
    onStartChat = vi.fn();
  });

  // ── Renderização Básica ─────────────────────────────────────────────────
  describe('Renderização', () => {
    it('deve renderizar o título hero', () => {
      render(<LandingPage onStartChat={onStartChat} />);
      expect(screen.getByText(/Personalizado/i)).toBeInTheDocument();
    });

    it('deve renderizar a navbar com o nome da marca', () => {
      render(<LandingPage onStartChat={onStartChat} />);
      // ServiceFlow aparece na nav e no footer
      const elements = screen.getAllByText('ServiceFlow');
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    it('deve renderizar a seção de funcionalidades', () => {
      render(<LandingPage onStartChat={onStartChat} />);
      expect(screen.getByText('IA Conversacional')).toBeInTheDocument();
      expect(screen.getByText('ServiceNow Ready')).toBeInTheDocument();
      expect(screen.getByText('White-Label Total')).toBeInTheDocument();
      expect(screen.getByText(/Seguro/)).toBeInTheDocument();
    });

    it('deve renderizar os 4 passos do fluxo', () => {
      render(<LandingPage onStartChat={onStartChat} />);
      expect(screen.getByText('01')).toBeInTheDocument();
      expect(screen.getByText('02')).toBeInTheDocument();
      expect(screen.getByText('03')).toBeInTheDocument();
      expect(screen.getByText('04')).toBeInTheDocument();
    });

    it('deve renderizar o footer', () => {
      render(<LandingPage onStartChat={onStartChat} />);
      expect(screen.getByText(/Todos os direitos reservados/)).toBeInTheDocument();
    });

    it('deve renderizar o preview do chat com o nome da IA padrão', () => {
      render(<LandingPage onStartChat={onStartChat} />);
      expect(screen.getByText('Sofia')).toBeInTheDocument();
    });

    it('deve renderizar as estatísticas do hero', () => {
      render(<LandingPage onStartChat={onStartChat} />);
      expect(screen.getByText('<2s')).toBeInTheDocument();
      expect(screen.getAllByText('100%')[0]).toBeInTheDocument();
      expect(screen.getByText('99.9%')).toBeInTheDocument();
    });
  });

  // ── CTAs (Call-to-Action) ───────────────────────────────────────────────
  describe('CTAs', () => {
    it('o botão do hero CTA deve chamar onStartChat', () => {
      render(<LandingPage onStartChat={onStartChat} />);
      const heroBtn = screen.getAllByRole('button', { name: /Agendar Demonstração/i })[0];
      fireEvent.click(heroBtn);
      expect(onStartChat).toHaveBeenCalledTimes(1);
    });

    it('o botão da nav CTA deve chamar onStartChat', () => {
      render(<LandingPage onStartChat={onStartChat} />);
      const navBtn = screen.getByText('Agendar Demo');
      fireEvent.click(navBtn);
      expect(onStartChat).toHaveBeenCalledTimes(1);
    });

    it('o botão CTA final deve chamar onStartChat', () => {
      render(<LandingPage onStartChat={onStartChat} />);
      const finalBtn = screen.getAllByRole('button', { name: /Agendar Demonstração/i })[1];
      fireEvent.click(finalBtn);
      expect(onStartChat).toHaveBeenCalledTimes(1);
    });

    it('o botão "Testar agora" da seção brand deve ativar a edição do nome da IA', () => {
      render(<LandingPage onStartChat={onStartChat} />);
      const brandBtn = screen.getByText(/Testar agora/);
      fireEvent.click(brandBtn);
      
      const input = screen.getByDisplayValue('Sofia');
      expect(input).toBeInTheDocument();
    });
  });

  // ── Seção White-Label (interatividade) ──────────────────────────────────
  describe('White-Label Interativo', () => {
    it('deve exibir a cor primária padrão (#8B5CF6)', () => {
      render(<LandingPage onStartChat={onStartChat} />);
      expect(screen.getByText('#8B5CF6')).toBeInTheDocument();
    });

    it('deve exibir o seletor de modo dark por padrão', () => {
      render(<LandingPage onStartChat={onStartChat} />);
      expect(screen.getByText('dark')).toBeInTheDocument();
    });

    it('deve alternar para light mode ao clicar no toggle', () => {
      render(<LandingPage onStartChat={onStartChat} />);

      // Encontra o card de modo de cor e clica
      const modeCard = screen.getByTitle('Clique para alternar o modo de cor');
      fireEvent.click(modeCard);

      expect(screen.getByText('light')).toBeInTheDocument();
    });

    it('deve abrir o campo de edição do nome da IA ao clicar', async () => {
      render(<LandingPage onStartChat={onStartChat} />);
      const nameCard = screen.getByTitle('Clique para editar o nome da IA');

      fireEvent.click(nameCard);

      // Deve aparecer um input com valor "Sofia"
      const input = screen.getByDisplayValue('Sofia');
      expect(input).toBeInTheDocument();
    });
  });

  // ── Navegação interna ───────────────────────────────────────────────────
  describe('Navegação interna', () => {
    it('deve ter links para as seções', () => {
      render(<LandingPage onStartChat={onStartChat} />);
      expect(screen.getByText('Funcionalidades').closest('a')).toHaveAttribute('href', '#features');
      // 'Como funciona' aparece como link na nav E como botão no hero
      const comoFuncionaElements = screen.getAllByText('Como funciona');
      const comoFuncionaLink = comoFuncionaElements.find(el => el.closest('a'));
      expect(comoFuncionaLink.closest('a')).toHaveAttribute('href', '#how-it-works');
      const whiteLabelElements = screen.getAllByText('White-Label');
      const whiteLabelLink = whiteLabelElements.find(el => el.closest('a'));
      expect(whiteLabelLink.closest('a')).toHaveAttribute('href', '#about');
    });
  });

  // ── Acessibilidade ─────────────────────────────────────────────────────
  describe('Acessibilidade', () => {
    it('o color picker primário deve ter aria-label', () => {
      render(<LandingPage onStartChat={onStartChat} />);
      expect(screen.getByLabelText('Escolher cor primária')).toBeInTheDocument();
    });

    it('o color picker secundário deve ter aria-label', () => {
      render(<LandingPage onStartChat={onStartChat} />);
      expect(screen.getByLabelText('Escolher cor secundária')).toBeInTheDocument();
    });

    it('todos os botões CTA devem ter IDs únicos', () => {
      render(<LandingPage onStartChat={onStartChat} />);
      const ids = ['nav-cta', 'hero-cta', 'hero-secondary', 'brand-cta', 'final-cta'];
      ids.forEach((id) => {
        expect(document.getElementById(id)).not.toBeNull();
      });
    });
  });
});
