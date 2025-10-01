const baseUrl = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

function resolveAsset(path: string): string {
  return `${baseUrl}${path.replace(/^\//, '')}`;
}

function handleSoundboard(): void {
  const container = document.querySelector('[data-sound-container]') ?? document.body;
  const tiles = document.querySelectorAll<HTMLElement>('[data-sound-file]');

  tiles.forEach((tile) => {
    const file = tile.dataset.soundFile;
    if (!file) return;

    const play = () => {
      const audio = new Audio(resolveAsset(`sounds/${file}`));
      audio.preload = 'auto';
      audio.autoplay = true;
      audio.loop = false;
      audio.addEventListener('ended', () => audio.remove());
      audio.addEventListener('error', () => audio.remove());
      container.append(audio);
      void audio.play().catch(() => {
        audio.remove();
      });
    };

    tile.addEventListener('click', play);
    tile.addEventListener('keydown', (event) => {
      if (event.defaultPrevented) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        play();
      }
    });
  });
}

function handleGrooves(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-groove-file]');
  let currentButton: HTMLButtonElement | null = null;
  let grooveAudio: HTMLAudioElement | null = null;

  const updateState = (button: HTMLButtonElement | null, state: 'idle' | 'active') => {
    if (!button) return;
    button.setAttribute('data-state', state);
    const active = button.querySelector<HTMLElement>('.groove-player__active');
    const inactive = button.querySelector<HTMLElement>('.groove-player__inactive');
    active?.toggleAttribute('hidden', state !== 'active');
    inactive?.toggleAttribute('hidden', state === 'active');
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const file = button.dataset.grooveFile;
      if (!file) return;

      if (currentButton === button) {
        grooveAudio?.pause();
        grooveAudio?.remove();
        grooveAudio = null;
        updateState(currentButton, 'idle');
        currentButton = null;
        return;
      }

      grooveAudio?.pause();
      grooveAudio?.remove();

      const audio = new Audio(resolveAsset(`grooves/${file}`));
      audio.loop = true;
      audio.preload = 'metadata';
      audio.autoplay = true;
      audio.addEventListener('error', () => audio.remove());
      document.body.append(audio);
      void audio.play().catch(() => {
        audio.remove();
      });

      updateState(currentButton, 'idle');
      updateState(button, 'active');
      grooveAudio = audio;
      currentButton = button;
    });

    updateState(button, button.dataset.state === 'active' ? 'active' : 'idle');
  });
}

handleSoundboard();
handleGrooves();
