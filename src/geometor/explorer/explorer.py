"""
explorer
"""
from matplotlib.widgets import Button

class Explorer:
    """
    The Explorer class encapsulates the interactive exploration of geometric
    plots. It extends the functionalities of the Sequencer to allow the user
    to navigate through the elements using buttons.

    Attributes:
        sequencer (Sequencer): The Sequencer object containing the geometric model and plot.
    """
    def __init__(self, sequencer: Sequencer):
        """
        Initializes the Explorer with the given Sequencer object.

        Args:
            sequencer (Sequencer): The Sequencer object containing the geometric model and plot.
        """
        self.sequencer = sequencer
        self.current_index = 0
        self.setup_buttons()

    def setup_buttons(self):
        """Sets up the buttons for navigation."""
        axprev = self.sequencer.fig.add_axes([0.7, 0.05, 0.1, 0.075])
        axnext = self.sequencer.fig.add_axes([0.81, 0.05, 0.1, 0.075])
        bnext = Button(axnext, 'Next')
        bprev = Button(axprev, 'Previous')
        bnext.on_clicked(self.next_element)
        bprev.on_clicked(self.prev_element)

    def next_element(self, event):
        """Callback for the Next button. Moves to the next element."""
        self.current_index += 1
        self.current_index %= len(self.sequencer.model.items())
        self.update_plot()

    def prev_element(self, event):
        """Callback for the Previous button. Moves to the previous element."""
        self.current_index -= 1
        self.current_index %= len(self.sequencer.model.items())
        self.update_plot()

    def update_plot(self):
        """Updates the plot based on the current index."""
        # Logic to update the plot with the current element
        pass

