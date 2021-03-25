mkdir build
cd build
cmake -G "MinGW Makefiles" .. -DBUILD_SHARED_LIBS=OFF -DBUILD_CLAR=OFF -DTHREADSAFE=ON -DUSE_SSH=OFF -DCMAKE_INSTALL_PREFIX=../output
cmake --build . --target install
