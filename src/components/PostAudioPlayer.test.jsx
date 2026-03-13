import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import PostAudioPlayer from './PostAudioPlayer'

function createMockSpeechSynthesis() {
    return {
        speak: vi.fn(),
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        getVoices: vi.fn(() => [
            { name: 'English Voice', lang: 'en-US' }
        ]),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }
}

describe('PostAudioPlayer', () => {
    let mockSynth

    beforeEach(() => {
        mockSynth = createMockSpeechSynthesis()
        window.speechSynthesis = mockSynth
        window.SpeechSynthesisUtterance = class {
            constructor() {
                this.rate = 1
                this.pitch = 1
                this.voice = null
                this.onend = null
                this.onerror = null
            }
        }
    })

    afterEach(() => {
        delete window.speechSynthesis
        delete window.SpeechSynthesisUtterance
    })

    it('renders the play button and label', () => {
        render(<PostAudioPlayer text="Hello world" />)
        expect(screen.getByText('Listen to this post')).toBeInTheDocument()
        expect(screen.getByLabelText('Play')).toBeInTheDocument()
    })

    it('starts speech when play is clicked', async () => {
        const user = userEvent.setup()
        render(<PostAudioPlayer text="Hello world" />)

        await user.click(screen.getByLabelText('Play'))

        expect(mockSynth.speak).toHaveBeenCalledTimes(1)
    })

    it('shows pause button while playing', async () => {
        const user = userEvent.setup()
        render(<PostAudioPlayer text="Hello world" />)

        await user.click(screen.getByLabelText('Play'))

        expect(screen.getByLabelText('Pause')).toBeInTheDocument()
    })

    it('pauses speech when pause is clicked', async () => {
        const user = userEvent.setup()
        render(<PostAudioPlayer text="Hello world" />)

        await user.click(screen.getByLabelText('Play'))
        await user.click(screen.getByLabelText('Pause'))

        expect(mockSynth.pause).toHaveBeenCalledTimes(1)
    })

    it('shows stop button while playing and stops when clicked', async () => {
        const user = userEvent.setup()
        render(<PostAudioPlayer text="Hello world" />)

        await user.click(screen.getByLabelText('Play'))
        await user.click(screen.getByLabelText('Stop'))

        expect(mockSynth.cancel).toHaveBeenCalled()
    })

    it('does not render when speechSynthesis is unavailable', () => {
        delete window.speechSynthesis
        const { container } = render(<PostAudioPlayer text="Hello world" />)
        expect(container.innerHTML).toBe('')
    })
})
