export const templates = new Map<string, string>([
  [
    "emptyModel",
    '<?xml version="1.0" encoding="UTF-8"?>\n<model xmlns="http://www.cellml.org/cellml/2.0#" name="">\n\t\n</model>',
  ],
  [
    "sampleModel",
    `<?xml version="1.0" encoding="UTF-8"?>
  <model xmlns="http://www.cellml.org/cellml/2.0#" name="simpleModel">
      <component name="environment">
          <variable name="time" units="second" interface="public"/>
      </component>
      <component name="flux">
          <variable name="A" initial_value="2" units="uM"/>
          <variable name="B" initial_value="3" units="uM"/>
          <variable name="C" initial_value="0" units="uM"/>
          <variable name="kf" initial_value="0.15" units="per_uM_per_second"/>
          <variable name="kb" initial_value="0.5" units="per_second"/>
          <variable name="J" initial_value="" units="uM_per_second"/>
          <variable name="time" units="second" interface="public"/>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
              <apply>
                  <eq/>
                  <ci>
                      J
                  </ci>
                  <apply>
                      <minus/>
                      <apply>
                          <times/>
                          <ci>
                              kf
                          </ci>
                          <ci>
                              A
                          </ci>
                          <ci>
                              B
                          </ci>
                      </apply>
                      <apply>
                          <times/>
                          <ci>
                              kb
                          </ci>
                          <ci>
                              C
                          </ci>
                      </apply>
                  </apply>
              </apply>
              <apply>
                  <eq/>
                  <apply>
                      <diff/>
                      <bvar>
                          <ci>
                              time
                          </ci>
                      </bvar>
                      <ci>
                          A
                      </ci>
                  </apply>
                  <apply>
                      <minus/>
                      <ci>
                          J
                      </ci>
                  </apply>
              </apply>
              <apply>
                  <eq/>
                  <apply>
                      <diff/>
                      <bvar>
                          <ci>
                              time
                          </ci>
                      </bvar>
                      <ci>
                          B
                      </ci>
                  </apply>
                  <apply>
                      <minus/>
                      <ci>
                          J
                      </ci>
                  </apply>
              </apply>
              <apply>
                  <eq/>
                  <apply>
                      <diff/>
                      <bvar>
                          <ci>
                              time
                          </ci>
                      </bvar>
                      <ci>
                          C
                      </ci>
                  </apply>
                  <ci>
                      J
                  </ci>
              </apply>
          </math>
      </component>
      <units name="uM">
          <unit units="mole" prefix="-6"/>
          <unit units="litre" exponent="-1"/>
      </units>
      <units name="per_second">
          <unit units="second" exponent="-1"/>
      </units>
      <units name="uM_per_second">
          <unit units="uM"/>
          <unit units="second" exponent="-1"/>
      </units>
      <units name="per_uM_per_second">
          <unit units="uM" exponent="-1"/>
          <unit units="second" exponent="-1"/>
      </units>
      <connection component_1="environment" component_2="flux">
          <map_variables variable_1="time" variable_2="time">
          </map_variables>
      </connection>
  </model>`,
  ],
]);
