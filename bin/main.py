import os
import coloredlogs

from docopt import docopt

from trading_bot.agent import Agent
from trading_bot.utils import (
    get_stock_data,
    format_currency,
    format_position,
    show_eval_result,
    switch_k_backend_device
)

import os
import logging

import numpy as np
from trading_bot.ops import (
    get_state
)

from voyant.Event import SignalEvent
from  voyant.DataHandler import DataHandler
import voyant.Portfolio as port
from voyant.strategies import BaseStrategy



'''
Strategy Class simply consumes Strategies and creates Signal Event
Initialized using Basket, model_name
It has portfolio rebalance algorithms
As well as dynamic bet sizing algorithm

'''

class MyStrategy(BaseStrategy):
    """docstring for MyStrategy"""
    def __init__(self):
        self.model_name = "double_dqn_google"
        self.data = []
        self.bars = []
        self.state_offset = 0
        self.position_sizing=0.1
        self.take_profit=1.4
        self.stop_loss=0.8
        self.datafeed_frequency="1min"
        self.universe=["GOOG"]
        self.optimization_params=None



    def before_trading_starts(self):
        pass
            

    def calculate_signals(self,latest_bar):
        """
        :input - Latest Bar
        """
        frequency= "1min"

        self.bars.append(latest_bar)
        self.data.append(latest_bar.iloc[-1]['close'])
        bars = self.bars
        window_size = 10


        signal = None
        if len(bars) < 11:
            return None

        if self.model_name is not None:
            agent = Agent(window_size, pretrained=True, model_name=self.model_name)
            agent.inventory = []
            state = get_state(self.data, self.state_offset , window_size + 1)
            reward = 0
            self.state_offset +=1
            next_state = get_state(self.data, self.state_offset, window_size + 1)
            action = agent.act(state, is_eval=True)

            #BUY
            if action == 1:
                agent.inventory.append(self.data)
                signal = SignalEvent(self.universe[0], bars[-1]['datetime'], "LONG",self.data[-1])
                print("BUY")

            #SELL
            elif action == 2 and len(agent.inventory) > 0:
                bought_price = agent.inventory.pop(0)
                signal = SignalEvent(self.universe[0], bars[-1]['datetime'], "EXIT_LONG",self.data[-1 ])
                print("SELL")
                

            # HOLD
            else:
                history.append((self.data, "HOLD"))
                signal = None
                print("HODL")


        return signal

    def rebalance(self):
        pass
