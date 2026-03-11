------------------------------ MODULE ProtocolDeficit ------------------------------
EXTENDS Naturals

CONSTANTS StreamCount

VARIABLE steady

Init == steady = TRUE
Next == steady' = steady
Spec == Init /\ [][Next]_steady

IntrinsicBeta1 == StreamCount - 1
TcpBeta1 == 0
QuicBeta1 == StreamCount - 1
FlowBeta1 == StreamCount - 1

TcpDeficit == IntrinsicBeta1 - TcpBeta1
QuicDeficit == IntrinsicBeta1 - QuicBeta1
FlowDeficit == IntrinsicBeta1 - FlowBeta1

InvIntrinsicShape ==
  /\ steady = steady
  /\ StreamCount > 1
  /\ IntrinsicBeta1 = StreamCount - 1

InvTcpDeficit ==
  /\ steady = steady
  /\ TcpDeficit = StreamCount - 1

InvQuicDeficit ==
  /\ steady = steady
  /\ QuicDeficit = 0

InvFlowDeficit ==
  /\ steady = steady
  /\ FlowDeficit = 0

=============================================================================
