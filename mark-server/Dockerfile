FROM node:16
WORKDIR /app
USER root

COPY . /app/

# RUN bash -c "\
#   yarn config set registry https://registry.npm.taobao.org/ && \
#   yarn install \
# "
#RUN bash -c "\
#    cp -rf mark_sqlite_docker.db mark_sqlite.db && \
#    gzip -d min_depend_libs_debian.tar.gz && \
#    tar -xvf min_depend_libs_debian.tar && \
#    rm -rf min_depend_libs_debian.tar "
#    yarn add sqlite3 --registry=https://registry.npmmirror.com --log-level info "
#    yarn \
#"
ENV LD_LIBRARY_PATH=/usr/local/lib:/usr/lib:/usr/lib/aarch64-linux-gnu:/app/min_depend_libs_debian

# EXPOSE 8001
# EXPOSE 8082
# RUN npm install -g yarn
# RUN yarn install

CMD [ "/bin/bash", "-c", "npm run prod" ]
